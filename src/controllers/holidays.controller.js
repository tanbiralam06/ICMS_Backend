import Holiday from "../models/holidays.model.js";

export const getHolidays = async (req, res, next) => {
  try {
    const { year } = req.query;
    const query = {};
    if (year) {
      query.year = parseInt(year);
    }

    // Default to current year if not specified? Or return all?
    // Let's typically return future holidays + current year history or just by year.
    // Ideally user sends year. If not, maybe just all sorted by date.

    const holidays = await Holiday.find(query).sort({ date: 1 });
    res.json({ success: true, data: holidays });
  } catch (err) {
    next(err);
  }
};

export const addHoliday = async (req, res, next) => {
  try {
    const { name, date, description } = req.body;

    // Basic validation
    if (!name || !date) {
      return res.status(400).json({ message: "Name and Date are required" });
    }

    const holidayDate = new Date(date);
    const existingHoliday = await Holiday.findOne({ date: holidayDate });
    if (existingHoliday) {
      return res
        .status(400)
        .json({ message: "Holiday already exists for this date." });
    }

    const holiday = new Holiday({
      name,
      date: holidayDate,
      year: holidayDate.getFullYear(),
      description,
      createdBy: req.user.id,
    });

    await holiday.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Holiday added successfully",
        data: holiday,
      });
  } catch (err) {
    if (err.code === 11000) {
      // Fallback for race condition duplicate
      return res
        .status(400)
        .json({ message: "Holiday already exists on this date." });
    }
    next(err);
  }
};

export const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Holiday.findByIdAndDelete(id);
    res.json({ success: true, message: "Holiday deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export default {
  getHolidays,
  addHoliday,
  deleteHoliday,
};
