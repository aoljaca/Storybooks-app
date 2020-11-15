const express = require('express')
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Story = require('../models/Story')
const router = express.Router()

router.get('/add', ensureAuth, async (req, res) => {
    try {
        res.render('stories/add')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

router.get('/edit/:storyId', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({_id: req.params.storyId}).lean()
        if (story.user != req.user.id) {
            res.redirect('/dashboard')
        } else {
            res.render('stories/edit', {
                story
            })
        }
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

router.delete('/:storyId', ensureAuth, async (req, res) => {
    try {
        await Story.deleteOne({_id: req.params.storyId})
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({status: 'public'})
        .populate('user')
        .lean()
        res.render('stories/index', {
            stories
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

router.get('/:storyId', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId)
        .populate('user')
        .lean()
        console.log(story.user)
        res.render('stories/show', {
            story
        })
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

router.get('/user/:id', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({user: req.params.id}).lean()
        .populate('user')
        res.render('stories/index', {
            stories
        })
    } catch (error) {
        console.error('error')
        res.render('error/500')
    }
})

router.put('/:storyId', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.storyId).lean()
        story = await Story.findOneAndUpdate({_id: req.params.storyId}, req.body, {
            new: true,
            runValidators: true
        })
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})

module.exports = router