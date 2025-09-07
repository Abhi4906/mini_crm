const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Joi = require('joi');

const customerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('').optional(),
  company: Joi.string().allow('').optional()
});


exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', email } = req.query;
    const skip = (page - 1) * limit;

   
    let query = { ownerId: req.user._id };

   
    if (email) {
      query.email = email;
      const customer = await Customer.findOne(query);
      return res.json({ customer: customer || null });
    }

  
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    res.json({
      customers,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalCustomers: total
    });
  } catch (error) {
    console.error('Error in getCustomers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    }).populate('ownerId', 'name email');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const leads = await Lead.find({ customerId: req.params.id });

    res.json({ customer, leads });
  } catch (error) {
    console.error('Error in getCustomer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.createCustomer = async (req, res) => {
  try {
    const { error } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const customer = await Customer.create({
      ...req.body,
      ownerId: req.user._id
    });

    res.status(201).json(customer);
  } catch (error) {
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error('Error in createCustomer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateCustomer = async (req, res) => {
  try {
    const { error } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.error('Error in updateCustomer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    
    await Lead.deleteMany({ customerId: req.params.id });

    res.json({ message: 'Customer removed' });
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
