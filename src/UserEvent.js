class UserEvent {
  constructor(userId, eventDate, eventName, planId) {
    this._userId = userId;
    this._eventDate = eventDate;
    this._eventName = eventName;
    this._planId = planId;
  }

  toString() {
    return `${this._userId},${this._eventDate},${this._eventName},${this._planId}`;
  }
}

module.exports = UserEvent;
