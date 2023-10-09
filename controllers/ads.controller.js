const Ads = require('../models/ads.model');
const getImageFileType = require('../utils/getImageFileType');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    res.json(await Ads.find());
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getById = async (req, res) => {
  try {
    const advert = await Ads.findById(req.params.id);
    if(!advert) res.status(404).json({ message: 'Not found' });
    else res.json(advert);
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSearched = async (req, res) => {

  try {
    const advert = await Ads.find({ title: {$regex: req.params.searchPhrase, $options: 'i' }});
    if (!advert) res.status(404).json({ message: 'Not found' });
    else res.json(advert);
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
};

exports.add = async (req, res) => {
  try {

    const { title, content, publishDate, price, location } = req.body;

    const fileType = req.file ? await getImageFileType(req.file) : 'unknown';
		if (
      title && typeof title === 'string' && 
      content && typeof content === 'string' && 
      publishDate && typeof publishDate === 'string' && 
      price && typeof price === 'string' &&
      location && typeof location === 'string' && 
      req.file && ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(fileType) 
      )
    {
      const newAd = await Ads.create({ title: title, content: content, publishDate: publishDate, price: price, location: location, user: req.session.login._id, image: req.file.filename });
      res.status(201).send({ message: 'New ad added' })
    } else {
      if (req.file) {
				fs.unlinkSync(`./public/uploads/${req.file.filename}`);
      res.status(400).send({ message: 'Bad request' });
      }
    }
  } 
  catch(err) {
    res.status(500).json({ message: err.message });
  }
};

exports.edit = async (req, res) => {
  const { title, content, publishDate, price, location } = req.body;

  try {

    const fileType = req.file ? await getImageFileType(req.file) : 'unknown';
    const advert = await Ads.findById(req.params.id);

    if(advert){
      await Ads.updateOne({ _id: req.params.id }, { $set: { title: title, content: content, publishDate: publishDate, price: price, location: location, image: req.file.filename }});
      res.status(201).send({ message: 'Ad updated' });
    }
    else {
      res.status(400).send({ message: 'Bad request' });
      }
    }
  catch(err) {
    if (req.file) {
      fs.unlinkSync(`./public/uploads/${req.file.filename}`);
    }
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const advert = await Ads.findById(req.params.id);
    if(advert) {
      await Ads.deleteOne({ _id: req.params.id });
      res.status(201).send({ message: 'Ad deleted' });
    }
    else res.status(404).json({ message: 'Not found...' });
  }
  catch(err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchPhrase = async (req, res) => {
  const { searchPhrase } = req.params;
  try {
    const advert = await Ads.find({ $text: { $search: searchPhrase }});
    if(!advert) return res.status(404).json({ message: 'Not found...' });
    else res.json(advert);
  } 
  catch(err) {
    res.status(500).json({ message: err.message });
  }
};