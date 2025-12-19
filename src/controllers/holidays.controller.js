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

    const holidays = await Holiday.find(query).sort({ startDate: 1 });
    res.json({ success: true, data: holidays });
  } catch (err) {
    next(err);
  }
};

export const addHoliday = async (req, res, next) => {
  try {
    const { name, startDate, endDate, description } = req.body;

    // Basic validation
    if (!name || !startDate) {
      return res
        .status(400)
        .json({ message: "Name and Start Date are required" });
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);

    // Ensure start of day for comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Optional: Check for existing holidays in this range?
    // For now, let's allow it but typically you'd check overlap.
    const holiday = new Holiday({
      name,
      startDate: start,
      endDate: end,
      year: start.getFullYear(),
      description,
      createdBy: req.user.id,
    });

    await holiday.save();
    res.status(201).json({
      success: true,
      message: "Holiday added successfully",
      data: holiday,
    });
  } catch (err) {
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
