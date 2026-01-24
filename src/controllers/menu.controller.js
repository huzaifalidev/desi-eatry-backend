import Menu from "../models/menu.model.js";

// CREATE MENU ITEM
export const createMenu = async (req, res) => {
  try {
    const menu = await Menu.create({
      ...req.body,
      createdBy: "69753a83cb9387982c001395" // Replace with req.user.id when authentication is implemented
    });

    res.status(201).json({ msg: "Menu item created", menu });
  } catch (error) {
    res.status(500).json({ msg: "Menu create failed", error: error.message });
  }
};

// GET ALL MENU ITEMS
export const getMenus = async (req, res) => {
  const menus = await Menu.find().sort({ createdAt: -1 });
  res.json({ menus });
};

// GET SINGLE MENU ITEM
export const getMenuById = async (req, res) => {
  const menu = await Menu.findById(req.params.id);
  if (!menu) return res.status(404).json({ msg: "Menu not found" });
  res.json({ menu });
};

// UPDATE MENU
export const updateMenu = async (req, res) => {
  const menu = await Menu.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json({ msg: "Menu updated", menu });
};

// DELETE MENU
export const deleteMenu = async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.json({ msg: "Menu deleted" });
};
