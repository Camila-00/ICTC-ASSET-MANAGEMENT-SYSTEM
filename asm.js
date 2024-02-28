const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const ejs = require("ejs");
const app = express();
const session = require('express-session');  // Add this line
const port = 3000;
// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'school.angeloramirez@gmail.com',
    pass: 'yrnd exxs lflw lokv',
  },
});
// Connection URLs and Database Names
const dbConfig = {
  login: {
    url: 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/',
    dbName: 'Backend',
    collectionName: 'Details',
  },
  status: {
    url: 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/',
    dbName: 'Backend',
    collectionName: 'Status',
  },
  report: {
    url: 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/',
    dbName: 'Backend',
    collectionName: 'Report',
  },
  lending: {
    url: 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/',
    dbName: 'Backend',
    collectionName: 'Lending',
  },
  dBoard201: {
    url: 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/',
    dbName: 'Backend',
    collectionName: 'dBoard201',
  },
  dBoard202: {
    url: 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/',
    dbName: 'Backend',
    collectionName: 'dBoard202',
  },

  borrower: {
    url: 'mongodb+srv://dlsud-ramirez:ramirez_dlsud@cluster0.omal3j2.mongodb.net/',
    dbName: 'Backend',
    collectionName: 'Borrower',
  },
};
let client;
let loginDb;
let statusDb;
let reportDb;
let lendingDb;
let dBoard201Db;
let dBoard202Db;
let borrowerDb;

let loginCollectionName;
let statusCollectionName;
let reportCollectionName;
let lendingCollectionName;
let dBoard201DbCollectionName;
let dBoard202DbCollectionName;
let borrowerCollectionName;

async function connectToDatabases() {
  try {
    const loginClient = await MongoClient.connect(dbConfig.login.url);
    loginDb = loginClient.db(dbConfig.login.dbName);
    loginCollectionName = dbConfig.login.collectionName;

    const statusClient = await MongoClient.connect(dbConfig.status.url);
    statusDb = statusClient.db(dbConfig.status.dbName);
    statusCollectionName = dbConfig.status.collectionName;

    const reportClient = await MongoClient?.connect(dbConfig.report.url);
    reportDb = reportClient.db(dbConfig.report.dbName);
    reportCollectionName = dbConfig.report.collectionName;

    const lendingClient = await MongoClient.connect(dbConfig.lending.url);
    lendingDb = lendingClient.db(dbConfig.lending.dbName);
    lendingCollectionName = dbConfig.lending.collectionName;

    const dBoard201Client = await MongoClient.connect(dbConfig.dBoard201.url);
    dBoard201Db = dBoard201Client.db(dbConfig.dBoard201.dbName);
    dBoard201DbCollectionName = dbConfig.dBoard201.collectionName;

    const dBoard202Client = await MongoClient.connect(dbConfig.dBoard202.url);
    dBoard202Db = dBoard202Client.db(dbConfig.dBoard202.dbName);
    dBoard202DbCollectionName = dbConfig.dBoard202.collectionName;

    const borrowerClient = await MongoClient.connect(dbConfig.borrower.url);
    borrowerDb = borrowerClient.db(dbConfig.borrower.dbName);
    borrowerCollectionName = dbConfig.borrower.collectionName; 

    console.log('Connected to MongoDB!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));


// Serve the HTML files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'System')));



app.get('/', (req, res) => {
  res.render("indexwelcomepage");
});
app.get('/indexcustodianlogin', (req, res) => {
  res.render("indexcustodianlogin", { message: '' });
});

app.get('/indexcustodianhomepage.ejs', (req, res) => {
  res.render("indexcustodianhomepage", { message: '' });
});

app.get('/indexborrowerlogin.ejs', (req, res) => {
  res.render('indexborrowerlogin'); // Replace 'indexcustodianhomepage' with your actual template name
});

app.get('/indexwelcomepage.ejs', (req, res) => {
  res.render('indexwelcomepage'); // Replace 'indexwelcome' with your actual template name
});

app.get('/indexborrowforms', (req, res) => {
  const user = req.session.user || {};  // default to an empty object if user is undefined
  res.render('indexborrowforms', { user });
});



// Route to handle update request
app.post('/update', (req, res) => {
  const { serialNumber, newIssue } = req.body;
  const index = reportData.findIndex(item => item.serial_number === serialNumber);
  if (index !== -1) {
      reportData[index].issue = newIssue;
      res.sendStatus(200); // Send success status
  } else {
      res.status(404).send('Serial number not found.');
  }
});


app.get('/indexcustodianhomepage', async (req, res) => { // TRYING NA MAPAKITA YUNG FIRST NAME NG KUNG SINO NAGLOGIN JAN16
  try {
    // Check if the user is logged in and if there is a user in the session
    const user = req.session.user;

    if (!user || !user.email) {
      // Redirect to the login page if the user is not logged in
      return res.redirect('/indexcustodianlogin');
    }

    const userEmail = user.email;

    // Retrieve the user details including email from the database
    const custodianUser = await loginDb.collection(loginCollectionName).findOne({ email: userEmail });

    if (!custodianUser || !custodianUser.email) {
      // Redirect to the login page if user details are not found or email is not defined
      return res.redirect('/indexcustodianlogin');
    }

    // Log the value of email
    console.log('Email:', userEmail);

    // Render the view with the retrieved data
    res.render('indexcustodianhomepage', { user: user });
  } catch (error) {
    // Handle errors, e.g., redirect to an error page
    console.error('Error in /indexcustodianhomepage:', error);
    res.redirect('/error');
  }
});


app.get('/indexregisterborrowerpage.ejs', (req, res) => {
  res.render('indexregisterborrowerpage');
});

app.get('/indexfacultyreportinput', (req, res) => {
  // Logic to render or send the indexfacultyreportinput.ejs file
  res.render('indexfacultyreportinput');
});

app.get('/indexborrowercount', async(req, res) => { 
  const dBoard201DbCollection = dBoard201Db.collection(dBoard201DbCollectionName);
  const dBoard202DbCollection = dBoard202Db.collection(dBoard202DbCollectionName);

  const count201 = await dBoard201DbCollection.count();
  const count202 = await dBoard202DbCollection.count();

  const totalCount = count201 + count202;

  res.status(201).send({totalCount});
})


app.get('/indexreportcount', async(req, res) => { // CHANGE THIS NA KAPAG OTHER ROOMS NA EH MAY COUNTER DIN
  const reportCollection = reportDb.collection(reportCollectionName);
  const count = await reportCollection.count()
  res.status(201).send({count});
})

app.get('/indexborroweditem', async(req, res) => { // CHANGE THIS NA KAPAG OTHER ROOMS NA EH MAY COUNTER DIN
  const ledingCollection = lendingDb.collection(lendingCollectionName);
  const count = await ledingCollection.count()
  res.status(201).send({count});
})


app.post('/indexregisterborrowerpage', async (req, res) => { // BORROWER REGISTER // CHECK MO KUNG KAYA NA NAME AND EMAIL ANG HAHANAPIN
  // Handle registration logic here
  const { name, email, usernum, password } = req.body;

  console.log('User Input:', { name, email, usernum, password });

  // Assuming you have a MongoDB collection named 'borrower'
  const borrowerCollection = borrowerDb.collection(borrowerCollectionName);

  console.log('Checking if user already exists...');
  // Check if the user already exists
  const existingUser = await borrowerCollection.findOne({ email });

  if (existingUser) {
    console.log('User already exists. Sending 400 response...');
    res.status(400).send('Email already registered');
  } else {
    console.log('User does not exist. Registering user...');
    // If the user doesn't exist, save the registration data to the database
    await borrowerCollection.insertOne({ name, email, usernum, password });

    console.log('User registered successfully. Sending 201 response...');
    // Send a success response
    res.status(201).send('Registration successful');
  }
});

app.post('/indexcustodianlogin', async (req, res) => { // CUSTODIAN LOGIN - TRYING NA MAPAKITA YUNG FIRST NAME NG KUNG SINO NAGLOGIN JAN16
  const { email, password } = req.body;

  try {
    if (!loginDb) {
      console.log('Login database connection is not established yet.');
      return res.status(500).json({ error: 'Login database connection is not ready.' });
    }

    const user = await loginDb.collection(loginCollectionName).findOne({ email, password });

    if (user) {
      req.session.user = {
        email: user.email,
        first_name: user.first_name, // Make sure this property is available
        last_name: user.last_name
      };
      console.log('Login successful for user:', user);
      // res.status(200).render('indexcustodianlogin.ejs', { message: 'Login successful!', auth: req.session.user });
      res.status(200).json({ message: 'Login successful!', auth: req.session.user });
    } else {
      console.log('Invalid username or password.');
      res.status(401).render('indexcustodianlogin.ejs', { message: 'Invalid username or password.' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('indexcustodianlogin.ejs', { message: 'An error occurred during login.' });
  }
});

app.post('/indexborrowerlogin', async (req, res) => { // BORROWER LOGIN
  const { email, password } = req.body;

  try {
    if (!borrowerDb) {
      console.log('Login database connection is not established yet.');
      return res.status(500).json({ error: 'Login database connection is not ready.' });
    }

    const user = await borrowerDb.collection(borrowerCollectionName).findOne({ email, password });

    if (user) {
      req.session.user = user;  // Set the user in the session
      console.log('Login successful for user:', user);
      res.status(200).render('indexborrowerlogin.ejs', { user });
    } else {
      console.log('Invalid username or password.');
      res.status(401).render('indexborrowerlogin.ejs', { message: 'Invalid username or password.' });
    }
  } // Closing bracket for try block
  catch (error) {
    console.error('Error during login:', error);
    res.status(500).render('indexborrowerlogin.ejs', { message: 'An error occurred during login.' });
  }
});

app.post('/indexassettable', async (req, res) => { //Asset table 
  const {
    room,
    location,
    category,
    item_description,
    property_number,
    serial_number,
    unit_cost,
    rdf_number,
    rtf_number,
    //accountabilty,
    asset_status,
  } = req.body;
  try {
    console.log({
      room,
      location,
      category,
      item_description,
      //bundle,
      property_number,
      serial_number,
      unit_cost,
      rdf_number,
      rtf_number,
      //acountabilty,
      asset_status,
    })
    const client = new MongoClient(dbConfig.status.url);

    try {
      // Change: Dynamic collection name based on room
      const collectionName = `dBoard${room}`;
      // const collection = db.collection(collectionName);

      const assetDocument = {
        room,
        location,
        category,
        item_description,
        //bundle,
        property_number,
        serial_number,
        unit_cost,
        rdf_number,
        rtf_number,
        //accountability,
        asset_status,
      };
      const result = await statusDb.collection(collectionName).insertOne(assetDocument);
      // const result = await collection.insertOne(assetDocument);

      console.log(`Inserted a document with id: ${result.insertedId}`);
      // client.close();

      res.status(201).send('Asset stored successfully.');
    } catch (error) {
      console.error('Error during MongoDB operations:', error);
      res.status(500).send('Failed to submit asset.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Failed to connect to the database.');
  }
});

app.post('/indexfacultyreportinput', async (req, res) => { // BROKEN ITEMS FORM

  const { location, serial_number, property_number, issue } = req.body;

  console.log({ location, serial_number, property_number, issue })

  try {

    try {
      const assetDocument = { location, serial_number, property_number, issue }

      const result = await reportDb.collection(reportCollectionName).insertOne(assetDocument)

      console.log(`Inserted a document with id: ${result.insertedId}`);
      console.log('Inserted Document:', assetDocument); // Add this line

      res.status(201).send('Asset stored successfully.');
    } catch (error) {
      console.error('Error during MongoDB operations:', error);
      res.status(500).send('Failed to submit asset.');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    res.status(500).send('Failed to connect to the database.');
  }
});

app.get('/data', async (req, res) => { // CUSTODIAN HOMEPAGE
  try {
    // Check if the database connections are established
    if (!dBoard201Db || !dBoard202Db) {
      console.log('One or more database connections are not established yet.');
      return res.status(500).json({ error: 'One or more database connections are not ready.' });
    }

    // Fetch data from the MongoDB collections
    const data201 = await dBoard201Db.collection(dBoard201DbCollectionName).find({}).toArray();
    console.log('Fetched data from dBoard201Db:', data201);

    const data202 = await dBoard202Db.collection(dBoard202DbCollectionName).find({}).toArray();
    console.log('Fetched data from dBoard202Db:', data202);

    // Combine data from all collections if needed
    const allData = [...data201, ...data202];

    // Send the fetched data as a JSON response
    res.json(allData);
  } catch (error) {
    // Handle errors and send an error response
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to perform soft delete on a report
app.post('/indexreportsdelete', async (req, res) => {
  try {
      const { serial_number } = req.body;
      // Update the status of the item with the given serial number to false
      const result = await reportDb.collection(reportCollectionName).updateOne(
          { serial_number },
          { $set: { status: false } }
      );
      if (result.modifiedCount === 1) {
          res.sendStatus(200); // Send success status
      } else {
          res.status(404).send('Report not found.');
      }
  } catch (error) {
      console.error('Error deleting report:', error);
      res.sendStatus(500); // Send server error status
  }
});

app.get('/indexfacultyreportinputdata', async (req, res) => { // BROKEN ITEM REPORT DATABASE
  try {
    if (!reportDb) {
      console.log('Report database connection is not established yet.');
      return res.status(500).json({ error: 'Report database connection is not ready.' });
    }

    const reports = await reportDb.collection(reportCollectionName).find({}).toArray();
    console.log('Fetched data:', reports);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/indexborrowforms', async (req, res) => { //BORROWER FORMS
  const {
    name,
    email,
    usernum,
    item_description,
    barcode,
    borrow_date,
    return_date,
    status,
  } = req.body; // Use req.body instead of req.query

  try {
    const client = new MongoClient(dbConfig.lending.url); // Use dbConfig.lending.url

    try {
      await client.connect();
      const db = client.db(dbConfig.lending.dbName); // Use dbConfig.lending.dbName
      const collection = db.collection(dbConfig.lending.collectionName); // Use dbConfig.lending.collectionName

      const assetDocument = {
        name,
        email,
        usernum,
        item_description,
        barcode,
        borrow_date,
        return_date,
        status: status || "Pending",
      };

      const serializedAssetDocument = JSON.stringify(assetDocument);
      const result = await collection.insertOne(JSON.parse(serializedAssetDocument));


      console.log(`Inserted a document with id: ${result.insertedId}`);
      client.close();

      if (result.insertedId) {
        console.log("Data is registered:");
        console.log(assetDocument);

        const mailOptions = {
          from: 'school.angeloramirez@gmail.com',
          to: email,
          subject: 'Asset Borrowed',
          text: `Dear ${name},
          
          Your request has been approved for borrowing ${item_description} from our school's inventory. 
          
          We would like to remind you of our school's policy regarding the responsible use and return of borrowed items. 
          We place great importance on the timely return of assets to ensure they are readily available for other students/faculty who may require them.
          The item is needed to be returned on ${return_date} 
          Please arrange for the return of the ${item_description} to its designated location as soon as it is no longer required for your specific project or task.
          Your cooperation in this matter is vital to maintaining our operational efficiency and resource management.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
          } else {
            console.log("Email sent:", info.response);
          }
        });

        res.status(201).json({
          message: "Asset stored successfully.",
          user: { name, email, usernum }
        });
      } else {
        console.log("Data is undefined.");
        res.status(500).json({ message: "Failed to submit asset." });
      }
    } catch (error) {
      console.error("Error during MongoDB operations:", error);
      res.status(500).json({ message: "Failed to submit asset." });
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Failed to connect to the database." });
  }
});

app.get('/assets', async (req, res) => { // BORROWER DATA
  try {
    // Assuming you don't have a user authentication mechanism,
    // and you want to fetch all assets without filtering by user
    if (!lendingDb) {
      console.log('Lending database connection is not established yet.');
      return res.status(500).json({ error: 'Lending database connection is not ready.' });
    }

    const assets = await lendingDb.collection(lendingCollectionName)
      .find({ _id: { $exists: true, $ne: null } })
      .toArray();

    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.put('/assetsupdate/:barcode', async (req, res) => {
  const { barcode } = req.params;

  try {
      // Perform update of the "status" field to "Returned"
      const result = await lendingDb.collection(lendingCollectionName).updateOne(
          { barcode: barcode },
          { $set: { status: 'Returned' } }
      );

      if (result.modifiedCount === 1) {
          res.status(200).json({ message: 'Status updated to Returned successfully' });
      } else {
          res.status(404).json({ message: 'Entry not found' });
      }
  } catch (error) {
      console.error('Error updating status:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});




app.get('/item_description', async (req, res) => { // BARCODE SCANNING ON BORROWER FORMS
  try {
    // Check if the barcode parameter is present
    const { barcode } = req.query;
    if (!barcode) {
      return res.status(400).send('Barcode parameter is missing');
    }

    // Ensure case-insensitive matching for barcode
    const item = await dBoard201Db.collection(dBoard201DbCollectionName).findOne({ barcode: { $regex: new RegExp(`^${barcode}$`, 'i') } });

    if (!item) {
      return res.status(404).send('Item not found');
    }

    // Return a JSON response with structured data
    res.status(200).json({ description: item.item_description }); // Corrected key to "description"
  } catch (error) {
    console.error('Error fetching item description:', error);
    // Return the actual error message for debugging purposes
    res.status(500).send(`Error fetching item description: ${error.message}`);
  }
});

// Route to update a row
app.put('/updaterow/:serialNumber', async (req, res) => {
  const { serialNumber } = req.params;
  const { newIssue } = req.body;

  try {
    if (!reportDb) {
      console.log('Report database connection is not established yet.');
      return res.status(500).json({ error: 'Report database connection is not ready.' });
    }

    const result = await reportDb.collection(reportCollectionName).updateOne(
      { serial_number: serialNumber }, // Using 'serial_number' as the field name
      { $set: { issue: newIssue } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: 'Row updated successfully' });
    } else {
      res.status(404).json({ message: 'Entry not found' });
    }
  } catch (error) {
    console.error('Error updating row:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



connectToDatabases()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });