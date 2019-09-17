const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema =new  mongoose.Schema({
    name:{
        type:String,
        require:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        require:true,
        validate(value) {
            if(!validator.isEmail(value))
                throw Error('not a valid email')
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if(value.length < 7) {
                throw Error('Password length should be greater than 6')
            }
            else if(value.toLowerCase().includes('password')) {
                throw Error('Password contains the word passowrd!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

// Hash the plain-text password before saving
userSchema.pre('save', async function(next) {
    const user = this
    try{
        if(user.isModified('password')) {
            user.password = await bcrypt.hash(user.password,8)
        }
    } catch(e) {
        console.log(e)
    }
    next()
})

userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email})

    if(!user){
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.methods.generateAuthToken = async function() {
    
    user = this
    
    const token = jwt.sign({_id:user._id.toString()},'iamvinayakpatil')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token;
    
    
}

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}


const User = mongoose.model('User',userSchema)

module.exports = User