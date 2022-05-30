const Plan = require("./Plan");
const UserEvent = require("./UserEvent");

class User {
  constructor(id) {
    this._id = id;
    this._plan = null;
    this._userEvents = [];
  }

  get id() {
    return this._id;
  }

  get Plan() {
    return this._plan;
  }

  get UserEvents() {
    return this._userEvents;
  }

  addUserEvent(userEvent) {
    this._userEvents.push(userEvent);
  }

  signUp(date) {
    const newPlan = new Plan(0, date);
    this._plan = newPlan;
    this.addUserEvent(new UserEvent(this.id, date, "Sign Up", 0));
  }

  updatePlan(date, amount, planId) {
    planId = planId.replace(/(\r\n|\n|\r)/gm, "");
    this.addUserEvent(
      new UserEvent(this.id, date, this._plan.update(planId, date), planId)
    );
  }
}

module.exports = User;
