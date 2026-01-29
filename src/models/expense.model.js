import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['inventory', 'expense'], // restrict types
    required: true
  },
  item: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Expense', expenseSchema);