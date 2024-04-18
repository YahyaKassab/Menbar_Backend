const mongoose = require('mongoose')
const ScheduleDaySchema = new mongoose.Schema({
  // reference to the course
  Lectures: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Lecture',
      required: [true, 'A ScheduleDay must have a Lecture'],
    },
  ],
  dayOfWeek: {
    type: String,
    enum: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
})
const ScheduleDay = mongoose.model('ScheduleDay', ScheduleDaySchema)

module.exports = ScheduleDay
