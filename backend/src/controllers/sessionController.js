const mongoose = require('mongoose');
const StudySession = require('../models/StudySession');
const User = require('../models/User');
const { readDB, writeDB, updateById } = require('../utils/localDB');

const isOffline = () => mongoose.connection.readyState !== 1;

// @desc    Get all study sessions for user (with pagination)
// @route   GET /api/sessions
const getSessions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const subject = req.query.subject || null;
        const sortBy = req.query.sort || 'date';

        if (isOffline()) {
            const db = readDB();
            let userSessions = db.sessions.filter(s => s.user === req.user.id);
            
            // Filter by subject if provided
            if (subject) {
                userSessions = userSessions.filter(s => 
                    s.subject.toLowerCase().includes(subject.toLowerCase())
                );
            }

            // Sort
            userSessions.sort((a, b) => {
                if (sortBy === 'score') {
                    return b.focusScore - a.focusScore;
                } else if (sortBy === 'duration') {
                    return b.duration - a.duration;
                }
                return new Date(b.date) - new Date(a.date);
            });

            const total = userSessions.length;
            const pages = Math.ceil(total / limit);
            const startIndex = (page - 1) * limit;
            const paginatedSessions = userSessions.slice(startIndex, startIndex + limit);

            return res.status(200).json({
                success: true,
                sessions: paginatedSessions,
                pagination: {
                    total,
                    pages,
                    currentPage: page,
                    limit
                }
            });
        }

        // MongoDB query
        let query = { user: req.user.id };
        if (subject) {
            query.subject = new RegExp(subject, 'i');
        }

        const total = await StudySession.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const sortObj = {};
        
        if (sortBy === 'score') {
            sortObj.focusScore = -1;
        } else if (sortBy === 'duration') {
            sortObj.duration = -1;
        } else {
            sortObj.createdAt = -1;
        }

        const sessions = await StudySession.find(query)
            .sort(sortObj)
            .limit(limit)
            .skip((page - 1) * limit)
            .select('subject duration focusScore createdAt detections.phone analytics');

        res.status(200).json({
            success: true,
            sessions,
            pagination: {
                total,
                pages,
                currentPage: page,
                limit
            }
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to retrieve sessions',
            error: error.message 
        });
    }
};

// @desc    Create new study session
// @route   POST /api/sessions
const createSession = async (req, res) => {
    const { subject, duration, focusScore, detections, analytics } = req.body;

    // Validate required fields
    if (!subject || !duration || focusScore === undefined) {
        return res.status(400).json({ 
            success: false,
            message: 'Neural telemetry data incomplete.',
            required: ['subject', 'duration', 'focusScore']
        });
    }

    // Validate data ranges
    if (duration < 1 || duration > 480) {
        return res.status(400).json({ 
            success: false,
            message: 'Session duration must be between 1 and 480 minutes'
        });
    }

    if (focusScore < 0 || focusScore > 100) {
        return res.status(400).json({ 
            success: false,
            message: 'Focus score must be between 0 and 100'
        });
    }

    try {
        // Validate detections if provided
        const detectionData = detections || { phone: 0, distracted: 0, focused: 0, away: 0 };
        const analyticsData = analytics || {
            hourlyFocus: Array(24).fill(0),
            recoveryRate: focusScore > 70 ? 0.85 : 0.65,
            distractionResistance: Math.max(0, 100 - (detectionData.phone || 0) * 5)
        };

        if (isOffline()) {
            const db = readDB();
            const newSession = {
                _id: Date.now().toString(),
                user: req.user.id,
                subject,
                duration,
                focusScore,
                detections: detectionData,
                analytics: analyticsData,
                date: new Date()
            };
            db.sessions.push(newSession);

            // Update user stats offline
            const userIndex = db.users.findIndex(u => u._id === req.user.id);
            if (userIndex !== -1) {
                const user = db.users[userIndex];
                if (!user.stats) {
                    user.stats = { 
                        sessionsCompleted: 0, 
                        totalStudyTime: 0, 
                        averageFocusScore: 0,
                        bestFocusScore: 0,
                        streakDays: 1
                    };
                }
                user.stats.sessionsCompleted += 1;
                user.stats.totalStudyTime += duration;
                user.stats.bestFocusScore = Math.max(user.stats.bestFocusScore || 0, focusScore);
                user.stats.averageFocusScore = (user.stats.averageFocusScore * (user.stats.sessionsCompleted - 1) + focusScore) / user.stats.sessionsCompleted;
                user.lastSession = new Date();
            }

            writeDB(db);
            return res.status(201).json({
                success: true,
                session: newSession,
                message: 'Session saved locally (offline mode)'
            });
        }

        const session = await StudySession.create({
            user: req.user.id,
            subject,
            duration,
            focusScore,
            detections: detectionData,
            analytics: analyticsData
        });

        // Update User Stats
        const user = await User.findById(req.user.id);
        if (user) {
            user.stats.sessionsCompleted = (user.stats.sessionsCompleted || 0) + 1;
            user.stats.totalStudyTime = (user.stats.totalStudyTime || 0) + duration;
            user.stats.bestFocusScore = Math.max(user.stats.bestFocusScore || 0, focusScore);
            
            const prevAvg = user.stats.averageFocusScore || 0;
            const sessionCount = user.stats.sessionsCompleted;
            user.stats.averageFocusScore = (prevAvg * (sessionCount - 1) + focusScore) / sessionCount;
            user.lastSession = new Date();
            
            await user.save();
        }

        res.status(201).json({
            success: true,
            session,
            stats: {
                totalSessions: user.stats.sessionsCompleted,
                averageScore: user.stats.averageFocusScore,
                bestScore: user.stats.bestFocusScore,
                totalStudyTime: user.stats.totalStudyTime
            }
        });
    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to save session',
            error: error.message 
        });
    }
};

// @desc    Get comprehensive session statistics
// @route   GET /api/sessions/stats
const getStats = async (req, res) => {
    try {
        let sessions = [];
        if (isOffline()) {
            const db = readDB();
            sessions = db.sessions.filter(s => s.user === req.user.id);
        } else {
            sessions = await StudySession.find({ user: req.user.id });
        }

        if (sessions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No study sessions yet',
                stats: {
                    totalSessions: 0,
                    totalStudyTime: 0,
                    averageFocusScore: 0,
                    bestFocusScore: 0,
                    focusDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
                    phoneDetections: 0,
                    subjects: {},
                    weeklyTrend: Array(7).fill(0),
                    hourlyFocus: Array(24).fill(0)
                }
            });
        }

        // Calculate basic stats
        const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration, 0);
        const avgFocusScore = sessions.reduce((acc, s) => acc + s.focusScore, 0) / sessions.length;
        const bestFocusScore = Math.max(...sessions.map(s => s.focusScore));
        const worstFocusScore = Math.min(...sessions.map(s => s.focusScore));

        // Focus distribution (excellent, good, fair, poor)
        const focusDistribution = {
            excellent: sessions.filter(s => s.focusScore >= 90).length,
            good: sessions.filter(s => s.focusScore >= 70 && s.focusScore < 90).length,
            fair: sessions.filter(s => s.focusScore >= 50 && s.focusScore < 70).length,
            poor: sessions.filter(s => s.focusScore < 50).length
        };

        // Subject performance analysis
        const subjectMap = {};
        let totalPhoneDetections = 0;
        let totalRecoveryRate = 0;
        let totalDistractionResistance = 0;

        sessions.forEach(s => {
            // Subject stats
            if (!subjectMap[s.subject]) {
                subjectMap[s.subject] = {
                    subject: s.subject,
                    totalScore: 0,
                    sessions: 0,
                    totalTime: 0,
                    bestScore: 0,
                    worstScore: 100
                };
            }
            subjectMap[s.subject].totalScore += s.focusScore;
            subjectMap[s.subject].sessions += 1;
            subjectMap[s.subject].totalTime += s.duration;
            subjectMap[s.subject].bestScore = Math.max(subjectMap[s.subject].bestScore, s.focusScore);
            subjectMap[s.subject].worstScore = Math.min(subjectMap[s.subject].worstScore, s.focusScore);

            // Phone detections
            totalPhoneDetections += (s.detections?.phone || 0);

            // Analytics aggregation
            if (s.analytics) {
                totalRecoveryRate += s.analytics.recoveryRate || 0;
                totalDistractionResistance += s.analytics.distractionResistance || 0;
            }
        });

        const averageRecoveryRate = totalRecoveryRate / sessions.length;
        const averageDistractionResistance = totalDistractionResistance / sessions.length;

        const performanceData = Object.values(subjectMap).map(s => ({
            subject: s.subject,
            focusScore: Math.round(s.totalScore / s.sessions),
            totalTime: s.totalTime,
            sessions: s.sessions,
            bestScore: s.bestScore,
            worstScore: s.worstScore
        }));

        // Weekly trend (last 7 days)
        const weeklyTrend = Array(7).fill(0);
        const weeklyCount = Array(7).fill(0);
        const today = new Date();
        
        sessions.forEach(s => {
            const sessionDate = new Date(s.date || new Date());
            const daysAgo = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
            if (daysAgo < 7) {
                const dayIndex = 6 - daysAgo;
                weeklyTrend[dayIndex] += s.focusScore;
                weeklyCount[dayIndex] += 1;
            }
        });

        const weeklyAverage = weeklyTrend.map((score, i) => 
            weeklyCount[i] > 0 ? Math.round(score / weeklyCount[i]) : 0
        );

        // Hourly distribution
        const hourlyDistribution = Array(24).fill(0);
        const hourlyCount = Array(24).fill(0);

        sessions.forEach(s => {
            const date = new Date(s.date || new Date());
            const hour = date.getHours();
            hourlyDistribution[hour] += s.focusScore;
            hourlyCount[hour] += 1;
        });

        const hourlyFocus = hourlyDistribution.map((score, i) =>
            hourlyCount[i] > 0 ? Math.round(score / hourlyCount[i]) : 0
        );

        // Today's stats
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todaySessions = sessions.filter(s => {
            const sessionDate = new Date(s.date || new Date());
            return sessionDate >= todayStart;
        });

        const todayStudyTime = todaySessions.reduce((acc, s) => acc + s.duration, 0);
        const todayAvgFocus = todaySessions.length > 0
            ? todaySessions.reduce((acc, s) => acc + s.focusScore, 0) / todaySessions.length
            : 0;

        // Streak calculation
        let streakDays = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (let i = 0; i < 365; i++) {
            const dayStart = new Date(currentDate);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const daySession = sessions.some(s => {
                const sessionDate = new Date(s.date || new Date());
                return sessionDate >= dayStart && sessionDate < dayEnd;
            });

            if (daySession) {
                streakDays++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Phone detection trend
        const phoneDetectionTrend = sessions.length > 1
            ? sessions[sessions.length - 1].detections?.phone || 0
            : 0;
        const prevPhoneDetections = sessions.length > 1
            ? sessions[sessions.length - 2]?.detections?.phone || 0
            : 0;
        const phoneDetectionChange = phoneDetectionTrend < prevPhoneDetections ? 'decreasing' : 
                                    phoneDetectionTrend > prevPhoneDetections ? 'increasing' : 'stable';

        res.status(200).json({
            success: true,
            stats: {
                totalSessions: sessions.length,
                totalStudyTime,
                averageFocusScore: Math.round(avgFocusScore * 10) / 10,
                bestFocusScore,
                worstFocusScore,
                streakDays,
                
                // Advanced metrics
                averageRecoveryRate: Math.round(averageRecoveryRate * 100),
                averageDistractionResistance: Math.round(averageDistractionResistance),
                
                // Distribution
                focusDistribution,
                phoneDetections: {
                    total: totalPhoneDetections,
                    avgPerSession: Math.round((totalPhoneDetections / sessions.length) * 100) / 100,
                    trend: phoneDetectionChange
                },
                
                // Performance data
                subjects: performanceData,
                weeklyTrend: weeklyAverage,
                hourlyFocus,
                
                // Recent data
                recentSessions: sessions.slice(-5).reverse(),
                today: {
                    studyTime: todayStudyTime,
                    focusScore: Math.round(todayAvgFocus * 10) / 10,
                    sessionsCompleted: todaySessions.length
                }
            }
        });
    } catch (error) {
        console.error('Stats calculation error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to calculate statistics',
            error: error.message 
        });
    }
};

module.exports = {
    getSessions,
    createSession,
    getStats
};
