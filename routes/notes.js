const express = require('express');
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");
//ROUTE:1 Get All the Notes using : GET "/api/notes/fetchallnotes" . Login required

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
//ROUTE:2 Add the Notes using : POST "/api/notes/addnote" . Login required
router.post('/addnote', fetchuser, [
    body("title", "Enter a valid title ").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({ min: 5 }),
    body("tag", "Tag should be atleast 3 characters").isLength({ min: 3 }),

], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //if there are errors return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
//ROUTE:3 Update an Existing Notes using : PUT "/api/notes/updatenote" . Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //creating a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //Find the Note to be updated
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json({note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
//ROUTE:4 Delete an Existing Notes using : DELETE "/api/notes/deletenote/:id" . Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //Find the Note to be Deleted and delete it
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({"Success" : "Note has been deleted",note : note});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;