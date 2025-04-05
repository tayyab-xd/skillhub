const express = require('express');
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userModel = require('../model/userModel.js')
const auth = require('../middlewares/authCheck.js')
const AWS = require('aws-sdk');
const cloudinary = require('cloudinary').v2
const fs = require("fs");
require('dotenv').config();

// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// })
const s3 = new AWS.S3({
  endpoint: process.env.STORJ_ENDPOINT,
  accessKeyId: process.env.STORJ_ACCESS_KEY,
  secretAccessKey: process.env.STORJ_SECRET_KEY,
  s3ForcePathStyle: true, 
  signatureVersion: 'v4',
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  console.log(req.body); 
  try {
    const userExists = await userModel.findOne({ email })
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    const hash = await bcrypt.hash(password, 10)
    const newUser = await userModel.create({
      name,
      email,
      password: hash
    })
    console.log('new user registered')
    res.status(201).json({ msg: 'Sign up successful', data: newUser });
  } catch (error) {
    res.status(500).json({ msg: 'Internal Server Error', error: error.message });
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(500).json({ msg: 'User do not exists' })
    }
    const checkPass = await bcrypt.compare(password, user.password)
    if (!checkPass) {
      return res.status(500).json({ msg: 'Incorrect Password' })
    }
    const token = jwt.sign({ name: user.name, email: user.email, userId: user.id }, process.env.JWT_SECRET)
    res.status(200).json({ msg: 'Login Successful', token, name: user.name, userId: user.id, email: user.email })

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server Error' });
  }
})

router.get('/profile/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).populate('courses').populate('coursesEnrolled');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/updateUser/:id', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    if (verify.userId !== req.params.id) {
      return res.status(401).json({ msg: 'Unauthorized user' });
    }

    const oldData = await userModel.findById(req.params.id);
    if (!oldData) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { name, email, designation, bio, password } = req.body;
    let hash;
    if (password) {
      hash = await bcrypt.hash(password, 10);
    }
    const newUser = {
      name: name || oldData.name,
      email: email || oldData.email,
      designation: designation,
      bio: bio || oldData.bio || '',
      password: password ? hash : oldData.password
    };
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = `profilePics/${Date.now()}_${image.name}`;
      const fileStream = fs.createReadStream(image.tempFilePath);
    
      const uploadedImage = await s3.upload({
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: fileStream,
        ContentType: image.mimetype,
        ACL: 'public-read' 
      }).promise();
      console.log(uploadedImage)
    
      newUser.profilePic = uploadedImage.Location; 
      newUser.profilePicId = uploadedImage.Key;   
    
      fs.unlink(image.tempFilePath, (err) => {
        if (err) console.error('Failed to delete temp file:', err);
      });
    }

    const updateUser = await userModel.findByIdAndUpdate(req.params.id, newUser, { new: true });

    console.log('User updated successfully');
    return res.status(200).json({ msg: 'User updated successfully', user: updateUser });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Internal Server Error' });
  }
});

router.put('/resetPassword/:id', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id)
    const hash = await bcrypt.hash(req.body.password, 10)
    const updatedUser = await userModel.findByIdAndUpdate(req.params.id, { password: hash }, { new: true })
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json(error)
  }
})

router.delete('/:profileId/deleteprofilepic', auth, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const verify = jwt.verify(token, process.env.JWT_SECRET);

    if (verify.userId !== req.params.profileId) {
      return res.status(401).json({ msg: 'Unauthorized User' });
    }

    const user = await userModel.findById(req.params.profileId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (!user.profilePicId) {
      return res.status(400).json({ msg: 'No profile pic to delete' });
    }

    try {
      await s3.deleteObject({
        Bucket: process.env.BUCKET_NAME,
        Key: user.profilePicId
      }).promise();
      console.log('Image deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
    }
    user.profilePicId = '';
    user.profilePic = '';
    await user.save();
    console.log('dp delete')
    res.status(200).json({ msg: 'Profile Pic Deleted' });
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
});


module.exports = router;