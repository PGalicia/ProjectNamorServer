const express = require("express");
const router = express.Router();

/* 
    Imports
*/

// Middleware
const checkFormatEvent = require("./../middleware/checkFormatEvent");
const checkBodyFormat = require("./../middleware/checkBodyFormat");

// Models
const Event = require("./../models/event");
const Guest = require("./../models/guest");
const Item = require("./../models/item");
const EventGuest = require("./../models/eventGuest");
const AssignedItem = require("./../models/assignedItem");

/*
    Associations
*/

// Event_Guest
Event.belongsToMany(Guest, {
    foreignKey: "eventId", 
    otherKey: "guestId",
    through: EventGuest
});

Guest.belongsToMany(Event, { 
    foreignKey: "guestId",
    otherKey: "eventId", 
    through: EventGuest
});

// Assigned_Item
Event.hasMany(AssignedItem, {
    foreignKey: "eventId"
});

Guest.hasMany(AssignedItem, {
    foreignKey: "guestId"
});

Item.hasMany(AssignedItem, {
    foreignKey: "itemId"
});

/*
    HTTP Requests

    Additional Notes:
        - On HTTP GET request, it will retrieve event information
        including information associated with that event
        such as Guest, and Item.
        - On HTTP PATCH request, it will only change the main
        information under the event such as the name of the event,
        or location. It CANNOT change Guest's or Item's information.
        - On HTTP POST request, it will add the main information under
        the event such as the name of the event, or location. In addition,
        it will automatically add the guest as the possible attendees for 
        that event.
        - On HTTP DELETE request, it will delete the rows with the specified
        id in EVENT, ASSIGNEDITEM, and EVENTGUEST
*/

// GET all events
router.get("/", (req, res, next) => {

    console.log("Fetching all events");

    Event.findAll({
        include: [{
            model: Guest,
            through: {
                attributes: ["isGoing"]
            }
        }, {
            model: AssignedItem
        }]
    })
        .then(e => {
            res.status(200).json(e);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

// GET the event with specified the "id"
router.get("/:eventId", (req, res, next) => {
    
    const eventId = req.params.eventId;

    console.log(`Fetching event ${eventId}`);
    
    Event.findOne({
        where: {
            rowid: eventId
        },
        include: [{
            model: Guest,
            through: {
                attributes: ["isGoing"]
            }
        }, {
            model: AssignedItem
        }]
    })
        .then(e => {
            res.status(200).json(e);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

// POST a new event
router.post("/", checkBodyFormat, (req, res, next) => {

    let newEventId = null;

    Event.create({
        name: req.body.name,
        datetime: req.body.datetime,
        location: req.body.location
    })
        .then(result => {
            newEventId = result.rowid;
            return Guest.findAll({
                attributes: [["rowid", "guestId"]],
                raw: true
            })
        })
        .then(guests => {
            for(let guest of guests) {
                guest.isGoing = 0;
                guest.eventId = newEventId;
            }
            return guests;
        })
        .then(guests => {
            for(let guest of guests) {
                EventGuest.create(guest);
            }
        })
        .then(() => {
            res.status(201).json({
                message: "Event is succesfully created"
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

// PATCH the event with the specified "eventId"
router.patch('/:eventId', checkFormatEvent, (req, res, next) => {
    const rowid = req.params.eventId;
    const query = req.query;
    console.log(`Fetching event ${rowid}`);
    
    Event.update(query, {
        where: {
            rowid
        }
    })
        .then(e => {
            res.status(200).json({
                message: "Updated Succesfully"
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
});

// DELETE the event with the specified "eventId"
router.delete('/:eventId', (req, res, next) => {
    
    const rowid = req.params.eventId;
    
    Event.findOne({
        where: {
            rowid
        }
    })
        .then(result => {
            if(!result) {
                throw `Event ${rowid} does not exist`;
            }
            Event.destroy({
                where: {
                    rowid
                }
            })
        })
        .then(() => {
            EventGuest.destroy({
                where: {
                    eventId: rowid
                }
            })
        })
        .then(() => {
            AssignedItem.destroy({
                where: {
                    eventId: rowid
                }
            })
        })
        .then(e => {
            res.status(200).json({
                message: `event ${rowid} is deleted from EVENT, ASSIGNEDITEM, and EVENTGUEST`
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;