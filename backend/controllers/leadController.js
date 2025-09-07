const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Joi = require('joi');

const leadSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('').optional(),
  status: Joi.string().valid('New', 'Contacted', 'Converted', 'Lost').required(),
  value: Joi.number().min(0).optional().default(0),
  customerId: Joi.string().required()
});

exports.getLeads = async (req, res) => {
  try {
    const { status, customerId } = req.query;
    let query = { ownerId: req.user._id };

    if (status) query.status = status;
    if (customerId) query.customerId = customerId;

    const leads = await Lead.find(query)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    }).populate('customerId', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { error } = leadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

   
    const customer = await Customer.findOne({
      _id: req.body.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const lead = await Lead.create({
      ...req.body,
      ownerId: req.user._id
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('customerId', 'name email');

    res.status(201).json(populatedLead);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { error } = leadSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

  
    const customer = await Customer.findOne({
      _id: req.body.customerId,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('customerId', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getLeadStats = async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $match: { ownerId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};