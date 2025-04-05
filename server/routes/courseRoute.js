const express = require('express');
const router = express.Router()
const jwt = require('jsonwebtoken');
const courseModel = require('../model/courseModel')
const auth = require('../middlewares/authCheck')
const fs = require("fs");
const userModel = require('../model/userModel');
const AWS = require('aws-sdk');

const cloudinary = require('cloudinary').v2
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})
const s3 = new AWS.S3({
    endpoint: process.env.STORJ_ENDPOINT,
    accessKeyId: process.env.STORJ_ACCESS_KEY,
    secretAccessKey: process.env.STORJ_SECRET_KEY,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
});


router.post("/upload", auth, async (req, res) => {
    try {
        // Validate required fields
        const { title, description, category } = req.body;
        if (!title || !description || !category || !req.files?.thumbnail || !req.files?.video) {
            return res.status(400).json({ msg: "Missing required fields" });
        }

        // Verify JWT
        const token = req.headers.authorization?.split(" ")[1];
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        // Validate file types
        const thumbnailMimeType = req.files.thumbnail.mimetype;
        const videoMimeType = req.files.video.mimetype;
        
        if (!thumbnailMimeType.startsWith('image/')) {
            return res.status(400).json({ msg: "Thumbnail must be an image file" });
        }
        
        if (!videoMimeType.startsWith('video/')) {
            return res.status(400).json({ msg: "Uploaded file must be a video" });
        }

        // Upload thumbnail
        let image;
        try {
            const fileName = `CourseThumbnail/${Date.now()}_${req.files.thumbnail.name.replace(/\s+/g, '_')}`;
            const fileStream = fs.createReadStream(req.files.thumbnail.tempFilePath);
            
            image = await s3.upload({
                Bucket: process.env.BUCKET_NAME,
                Key: fileName,
                Body: fileStream,
                ContentType: thumbnailMimeType,
                ACL: 'public-read'
            }).promise();
            
            fs.unlinkSync(req.files.thumbnail.tempFilePath);
        } catch (error) {
            console.error("Thumbnail upload error:", error);
            return res.status(500).json({ msg: "Error uploading thumbnail", error: error.message });
        }

        // Upload video
        let video;
        try {
            const videoFileName = `CourseVideos/${Date.now()}_${req.files.video.name.replace(/\s+/g, '_')}`;
            const videoStream = fs.createReadStream(req.files.video.tempFilePath);
            
            video = await s3.upload({
                Bucket: process.env.BUCKET_NAME,
                Key: videoFileName,
                Body: videoStream,
                ContentType: videoMimeType,
                ACL: 'public-read'
            }).promise();
            
            fs.unlinkSync(req.files.video.tempFilePath);
            
            
        } catch (error) {
            // Clean up thumbnail if video upload fails
            if (image) {
                await s3.deleteObject({
                    Bucket: process.env.BUCKET_NAME,
                    Key: image.Key
                }).promise();
            }
            console.error("Video upload error:", error);
            return res.status(500).json({ msg: "Error uploading video", error: error.message });
        }

        // Create course in database
        const course = await courseModel.create({
            title,
            description,
            category,
            userId: verify.userId,
            thumbnail: image.Location,
            thumbnailId: image.Key,
            video: video.Location,
            videoId: video.Key
        });

        // Update user's courses
        await userModel.findByIdAndUpdate(verify.userId, {
            $push: { courses: course._id }
        });

        console.log('New course uploaded:', course._id);
        res.status(201).json({ 
            msg: "Course Uploaded Successfully",course});
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ 
            msg: "Server Error", 
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.get('/all-courses', async (req, res) => {
    try {
        const courses = await courseModel.find().populate('userId', 'name email profilePicId designation')
        res.status(200).json(courses)
    } catch (error) {
        console.log(error)
    }
})

router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const { userId } = jwt.verify(token, process.env.JWT_SECRET);

        const course = await courseModel.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Course not found" });

        course.reviews.push({ userId, comment: req.body.newComment });
        await course.save();

        console.log('new comment uploaded')
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get('/:id/reviews', auth, async (req, res) => {
    try {
        const course = await courseModel.findById(req.params.id)
            .populate({
                path: 'reviews.userId',
                select: 'name profilePicId'
            });

        res.json(course);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/deletecomment/:courseId/:commentId', auth, async (req, res) => {
    try {
        const course = await courseModel.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const commentIndex = course.reviews.findIndex(
            (item) => item._id.toString() === req.params.commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ msg: 'Comment not found' });
        }

        course.reviews.splice(commentIndex, 1);
        await course.save();

        res.status(200).json({ msg: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ msg: 'Server error', error: error.message });
    }
});

router.post('/enroll/:courseId', auth, async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ msg: 'Authorization token is missing' });
    }

    try {
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        const course = await courseModel.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const user = await userModel.findById(verify.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.coursesEnrolled.some(item => item.toString() === req.params.courseId)) {
            return res.status(400).json({ msg: 'You are already enrolled in this course' });
        }

        user.coursesEnrolled.push(req.params.courseId);
        await user.save();


        if (course.students.some(item => item.userId.toString() === verify.userId)) {
            return res.status(400).json({ msg: 'You are already enrolled in this course' });
        }

        course.students.push({ userId: verify.userId });
        await course.save();

        res.status(200).json({ msg: 'You are successfully enrolled in the course' });

    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ msg: 'Error enrolling the student', error: error.message });
    }
});

router.delete('/leavecourse/:courseId', auth, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: 'Authorization token is missing' });
        }
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        const course = await courseModel.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        const user = await userModel.findById(verify.userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const userIndex = user.coursesEnrolled.findIndex(item => item.toString() === req.params.courseId);
        if (userIndex === -1) {
            return res.status(400).json({ msg: 'You are not enrolled in this course' });
        }

        user.coursesEnrolled.splice(userIndex, 1);
        await user.save();


        const courseIndex = course.students.findIndex(item => item.userId.toString() === verify.userId);
        if (courseIndex === -1) {
            return res.status(400).json({ msg: 'You are not enrolled in this course' });
        }

        course.students.splice(courseIndex, 1);
        await course.save();

        res.status(200).json({ msg: 'You have successfully left the course' });

    } catch (error) {
        console.error('Error leaving course:', error);
        res.status(500).json({ msg: 'Internal server error', error: error.message });
    }
});

router.delete('/deletecourse/:courseId', auth, async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(403).json({ msg: "No token provided" });
        const verify = jwt.verify(token, process.env.JWT_SECRET);

        const course = await courseModel.findById(req.params.courseId);
        if (!course) return res.status(404).json({ msg: "Course not found" });
        if (verify.userId !== course.userId.toString()) {
            return res.status(403).json({ msg: "Unauthorized User" });
        }

        if (course.videoId) {
            try {
                await s3.deleteObject({
                    Bucket: process.env.BUCKET_NAME,
                    Key: course.videoId
                }).promise();
                console.log('course video deleted from Storj');
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
        if (course.thumbnailId) {
            try {
                await s3.deleteObject({
                    Bucket: process.env.BUCKET_NAME,
                    Key: course.thumbnailId
                }).promise();
                console.log('course thumbnail deleted from Storj');
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }

        await courseModel.findByIdAndDelete(req.params.courseId);

        res.status(200).json({ msg: 'Course Deleted Successfully' });
    } catch (error) {
        console.error("Delete Course Error:", error);
        res.status(500).json({ msg: "Server Error", error: error.message });
    }
});

module.exports = router;