/**
 * Attendance Status Classification Helper
 */
const attendanceStatus = {
  /**
   * Determine whether a check-in timestamp is ON_TIME or LATE
   * Cutoff limit is set to 09:45 AM.
   * 
   * @param {Date} checkInDate - Timestamp of the kiosk check-in
   * @returns {String} 'ON_TIME' | 'LATE'
   */
  classifyArrival: (checkInDate = new Date()) => {
    const hours = checkInDate.getHours();
    const minutes = checkInDate.getMinutes();

    // 09:45 AM Threshold
    const CUTOFF_HOURS = 9;
    const CUTOFF_MINUTES = 45;

    if (hours < CUTOFF_HOURS) {
      return 'ON_TIME';
    }

    if (hours === CUTOFF_HOURS && minutes <= CUTOFF_MINUTES) {
      return 'ON_TIME';
    }

    return 'LATE';
  }
};

module.exports = attendanceStatus;
