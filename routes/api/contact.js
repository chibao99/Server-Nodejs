const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Contact = require('../../models/Contact');

//@route    POST api/contact
//@desc     Add contact
//@access   Public
router.post(
    '/',
    [
        check('name', 'Tên không được để rỗng').not().isEmpty(),
        check('email', 'Phải đặt đúng định dạng email').isEmail(),
        check('phone', 'Số điện thọai không được để rỗng').not().isEmpty(),
        check('content', 'Nội dung không được để rỗng').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, phone, content } = req.body;
        try {
            contact = new Contact({
                name,
                email,
                phone,
                content,
            });
            await contact.save();
            res.send('Create contact success');
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@route    GET api/contact
//@desc     Get all contact
//@access   Public
router.get('/', async (req, res) => {
    try {
        const contact = await Contact.find().populate('contact', [
            'name',
            'email',
            'phone',
            'content',
        ]);
        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route    DELETE api/contact/:contact_id
//@desc     Delete contact by id
//@access   Private
router.delete('/:contact_id', async (req, res) => {
    try {
        await Contact.findByIdAndRemove({
            _id: req.params.contact_id,
        });
        res.json({msg:'Xóa Thành Công'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
