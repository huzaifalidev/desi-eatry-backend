import Expense from "../models/expense.model.js";

// Create new expense
export const createExpense = async (req, res) => {
  try {
    const { type, item, date, quantity, unitPrice, notes } = req.body;

    const totalAmount = quantity * unitPrice;

    const expense = new Expense({
      type,
      item,
      date,
      quantity,
      unitPrice,
      totalAmount,
      notes,
    });

    await expense.save();
    res.status(201).json({
      msg: "Expense created",
      expense,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json({ expenses, count: expenses.length, msg: "Expenses fetched" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: "Expense not found" });
    res.status(200).json({ expense, msg: "Expense fetched" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update expense by ID
export const updateExpense = async (req, res) => {
  try {
    const { type, item, date, quantity, unitPrice, notes } = req.body;
    const totalAmount = quantity * unitPrice;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { type, item, date, quantity, unitPrice, totalAmount, notes },
      { new: true }
    );

    if (!expense) return res.status(404).json({ msg: "Expense not found" });

    res.status(200).json({ expense, msg: "Expense updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete expense by ID
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ msg: "Expense not found" });
    res.status(200).json({ msg: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
