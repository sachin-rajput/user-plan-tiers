const PLAN_TIERS = require("./PlanTiers");
const moment = require("moment");

class Plan {
  constructor(id, startDate) {
    this._id = id;
    this._startDate = startDate;
    this._expiryDate = null;
  }

  get ExpiryDate() {
    return this._expiryDate;
  }

  getEventName(oldId, newId) {
    const oldPlan = PLAN_TIERS[oldId];
    const newPlan = PLAN_TIERS[newId];

    if (oldPlan && newPlan) {
      if (oldId === newId) return "Renew";

      if (newPlan.seq > oldPlan.seq) {
        return "Upgrade";
      } else {
        return "Downgrade";
      }
    }

    return "Invalid Plan";
  }

  updateExpiry(newId, effectiveDate) {
    const newPlan = PLAN_TIERS[newId];

    const startDate = moment(effectiveDate, "YYYY-MM-DD");

    if (newPlan && newPlan.planLength === "Monthly") {
      this._expiryDate = startDate.add({ month: 1 }).format("YYYY-MM-DD");
    }

    if (newPlan && newPlan.planLength === "Yearly") {
      this._expiryDate = startDate.add({ year: 1 }).format("YYYY-MM-DD");
    }
  }

  update(newId, effectiveDate, amount) {
    const oldId = this._id;
    this._id = newId;
    this._startDate = effectiveDate;
    const eventName = this.getEventName(oldId, newId);

    if (
      eventName === "Upgrade" ||
      eventName === "Downgrade" ||
      eventName === "Renew"
    ) {
      this.updateExpiry(newId, effectiveDate);
    }

    return eventName;
  }
}

module.exports = Plan;
