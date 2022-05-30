const fs = require("fs");
const path = require("path");
const nReadlines = require("n-readlines");
const User = require("./User");

/**
 * Parses the file line by line and return an array of lines
 *
 * @param {string} filePath
 * @param {boolean} header
 */
const parseFile = (filePath, csvRecords = false, header = true) => {
  const inputData = [];
  const inputLines = new nReadlines(`data/${filePath}`);

  let line;
  let lineNumber = 1;

  if (header) line = inputLines.next(); //skip line 1 if header is present

  while ((line = inputLines.next())) {
    if (csvRecords) inputData.push(line.toString("ascii").split(","));
    else inputData.push(line.toString("ascii"));
    lineNumber++;
  }

  console.log(`parsed ${lineNumber} line(s) before end of file.`);
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(
    `The script uses approximately ${Math.round(used * 100) / 100} MB`
  );
  return inputData;
};

/**
 * Write to the file line by line, with header 
 *
 * @param {string} filePath
 * @param {boolean} header
 */
const writeToFile = (outputFileName, header, data) => {
  fs.writeFileSync(
    path.resolve(__dirname, `data/${outputFileName}`),
    header + "\n"
  );

  data.map((record) => {
    fs.appendFileSync(
      path.resolve(__dirname, `data/${outputFileName}`),
      record + "\n"
    );
  });
};

/**
 * Add users to our data structure
 * @param {*} users 
 */
const uploadUsers = (users) => {
  const usersDataset = new Map();

  users.map((user) => {
    const [userId, date] = user;
    const newUser = new User(userId);
    newUser.signUp(date);
    usersDataset.set(user[0], newUser);
  });

  return usersDataset;
};

/**
 * Scan all the purchases to perform plan updates
 * 
 * 
 * @param {string[]} purchases 
 * @param {Map[user_id, User]} usersDb 
 */
const scanPurchases = (purchases, usersDb) => {
  purchases.map((purchase) => {
    let [id, userId, date, amount, planId] = purchase;

    let user = usersDb.get(userId);
    // planId = planId.replaceAll("\r", "");
    user.updatePlan(date, amount, planId);
  });
};

/**
 * This will create a dump of all user events,
 * along with expiry date entry
 *
 * @param {Map[user_id, User]} usersDb
 */
const exportUserEventsLog = (usersDb) => {
  const data = [];

  usersDb.forEach((user) => {
    user.UserEvents.map((event) => {
      data.push(event.toString());
    });

    if (user.Plan.ExpiryDate) {
      data.push(`${user.id},${user.Plan.ExpiryDate},Expire,0`);
    }
  });

  return data;
};

/**
 * Read users input file
 */
const users = parseFile("users.csv", true);

/**
 * Lets store users in a Map data structure
 */
const usersDb = uploadUsers(users);

/**
 * Read purchases input file
 */
const purchases = parseFile("purchases.csv", true);

/**
 * Scan all purchases which will update plans and,
 * also create user events
 */
scanPurchases(purchases, usersDb);

// const outputData = [
//   "1,2021-01-05,Sign Up,0",
//   "1,2021-01-15,Upgrade,35385",
//   "1,2021-02-15,Renew,35385",
//   "1,2021-03-15,Downgrade,75448",
//   "1,2021-04-15,Expire,0",
// ];
const outputData = exportUserEventsLog(usersDb);

/**
 * Write data to the outputFile with header
 */
writeToFile("user-events.csv", "user_id,date,event,plan_id", outputData);
