const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const gigModel = require('../model/gigModel.js')
const userModel = require('../model/userModel.js')
const auth = require('../middlewares/authCheck.js')
const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2
const fs = require("fs");
require('dotenv').config();

const s3 = new AWS.S3({
  endpoint: process.env.STORJ_ENDPOINT,
  accessKeyId: process.env.STORJ_ACCESS_KEY,
  secretAccessKey: process.env.STORJ_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

router.post('/creategig', auth, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]
  const verify = jwt.verify(token, process.env.JWT_SECRET)
  try {
    const { title, description, category, price, deliveryTime } = req.body;
    if (!title || !description || !category || !price || !deliveryTime) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const image = req.files?.image;
    const uploadedImageKeys = [];
    const imageFiles = Array.isArray(image) ? image : [image];

    for (const image of imageFiles) {
      const fileName = `gigImages/${Date.now()}_${image.name}`;
      const fileStream = fs.createReadStream(image.tempFilePath);

      const uploadResult = await s3.upload({
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
        ContentType: image.mimetype,
        ACL: 'public-read',
      }).promise();

      uploadedImageKeys.push(uploadResult.Key);
    }
    const gig = await gigModel.create({
      title,
      description,
      category,
      price,
      deliveryTime,
      images: uploadedImageKeys,
      userId: verify.userId,
    });
    await userModel.findByIdAndUpdate(verify.userId, {
      $push: { gigs: gig._id }
    });
    res.status(201).json(gig);
  } catch (err) {
    console.error('Create gig error:', err);

    if (err.name === 'ValidationError') {
      return res.status(422).json({ error: err.message });
    }

    res.status(500).json({ error: 'Internal server error. Please try again later.' });
  }
});

router.get('/all-gigs', async (req, res) => {
  try {
    const gigs = await gigModel.find().populate('userId', 'name email profilePicId designation')
    res.status(200).json(gigs)
  } catch (error) {
    console.log(error)
  }
})

router.post('/add-review/:id', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    const { stars, comment } = req.body;

    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: "Stars must be between 1 and 5." });
    }
    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ error: "Comment is required and must be a string." });
    }
    const gig = await gigModel.findById(req.params.id);
    if (!gig) return res.status(404).json({ error: "Gig not found." });

    // if (gig.userId.toString()==verify.userId.toString()) {
    //   return res.status(400).json({ error: "Can not review your own gig" })
    // }
    const alreadyReviewed = gig.reviews.find(
      (review) => review.userId.toString() === verify.userId
    );
    if (alreadyReviewed) {
      return res.status(400).json({ error: "You have already reviewed this gig." });
    }
    gig.reviews.push({ userId: verify.userId, stars, comment });
    await gig.save();

    res.status(201).json({ message: "Review added successfully.", gig });
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token." });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired." });
    }
    res.status(500).json({ error: "Server error." });
  }
});

router.get('/get-reviews/:id', auth, async (req, res) => {
  try {
    const gig = await gigModel.findById(req.params.id)
      .populate('reviews.userId', 'name email profilePicId designation');

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    res.status(200).json({
      reviews: gig.reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
});

router.delete('/delete-review/:reviewId/:gigId', auth, async (req, res) => {
  try {
    const { reviewId, gigId } = req.params;

    const gig = await gigModel.findById(gigId);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });

    const reviewIndex = gig.reviews.findIndex(
      (review) => review._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    gig.reviews.splice(reviewIndex, 1);
    await gig.save();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;