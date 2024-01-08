const router = require("express").Router()
const { body, validationResult } = require('express-validator')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const Teacher = require('../models/teacher')
const Student = require('../models/student')

const saltRounds = 10;
const secret = 'please-fuck-yourself';
const options = { expiresIn: '60d' };

router.get("/", (req, res) => {

    res.json({ hi: "hii" })

})

router.post("/sign-up", [
    // Validate email
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
    // Validate password
    body('password').isLength({ min: 6 }).withMessage("Please enter a password more than 6 char"),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() });
    }
    try {

        console.log(req.body.email, req.body.password);
        const email = req.body.email;
        const password = req.body.password;
        const type = req.body.type;
        const userName = req.body.userName;
        if (userName == null || userName == undefined) {
            return res.json({ status: false, error: { message: "plese provide userName in the body" } });
        }

        if (type === 0) {
            let foundUser = await Student.findOne({ where: { email: email } });
            if (foundUser != null) {
                return res.json({ status: false, message: "User with this email already exists" });
            }
            let foundUser2 = await Student.findOne({ where: { userName: userName } });

            if (foundUser2 != null) {
                return res.json({ status: false, message: "User with this username already exists" });

            }

            else {

                try {
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            // Store hash in database here

                            Student.create({ email: email, password: hash, userName: userName }).then((result) => {

                                console.log("student created in database");

                                const payload = {
                                    id: result.dataValues.id,
                                    email: email,
                                    userName: userName

                                };

                                let token = jwt.sign(payload, secret, options);

                                return res.json({ status: true, message: "student account created", token: token })
                            }).catch((err) => {
                                return res.json({ status: false, error: err });
                            })
                        })
                    });

                } catch (error) {
                    return res.json({ status: false, error: error });

                }






            }
        }

        if (type == 1) {

            let foundUser = await Teacher.findOne({ where: { email: email } });
            if (foundUser != null) {
                return res.json({ status: false, message: "User with this email already exists" });
            }
            let foundUser2 = await Teacher.findOne({ where: { userName: userName } });

            if (foundUser2 != null) {
                return res.json({ status: false, message: "User with this username already exists" });

            }

            else {

                try {
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(password, salt, function (err, hash) {
                            // Store hash in database here

                            Teacher.create({ email: email, password: hash, userName: userName }).then((result) => {

                                console.log("Teacher account created in database");

                                const payload = {
                                    id: result.dataValues.id,
                                    email: email,
                                    userName: userName

                                };

                                let token = jwt.sign(payload, secret, options);

                                return res.json({ status: true, message: "Teacher account created", token: token })
                            }).catch((err) => {
                                return res.json({ status: false, error: err });
                            })
                        })
                    });

                } catch (error) {
                    return res.json({ status: false, error: error });

                }






            }

        }

        res.json({ status: false, error: { message: "plese provide type in the body" } });

    } catch (error) {

        return res.json({ status: false, error: error });

    }


})

router.post("/log-in", async (req, res) => {
    console.log(req.body.email, req.body.password);
    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;
    const type = req.body.type;

    if (email == null || email == undefined) {
        let foundUser = await Student.findOne({ where: { userName: userName } });
        if (foundUser != null) {
            console.log(foundUser);
            comparePassword(password, foundUser.dataValues.password)
                .then((isMatch) => {
                    if (isMatch) {
                        console.log('Password is correct!');
                    } else {
                        console.log('Incorrect password!');
                    }
                })
                .catch((error) => console.error(error));
            return res.json({ found: "found" })

        }

        else {
            return res.json({ status: false, error: "There is no no with this username" })
        }


    }

    if (userName == null || userName == undefined) {
        let foundUser = await Student.findOne({ where: { email: email } });



        if (foundUser != null) {
            console.log(foundUser);
            comparePassword( password, foundUser.dataValues.password)
                .then((isMatch) => {
                    if (isMatch) {
                        console.log('Password is correct!');
                    } else {
                        console.log('Incorrect password!');
                    }
                })
                .catch((error) => console.error(error));
            return res.json({ found: "found" })

        }


        else {
            return res.json({ status: false, error: "There is no no with this email" })

        }

    }

    res.json({ error: "not found" })




})


async function comparePassword(inputPassword, hashedPassword) {
    try {
        const match = await bcrypt.compare(inputPassword, hashedPassword);
        return match;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}






module.exports = router