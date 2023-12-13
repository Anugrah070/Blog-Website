const express=require('express');
const router=express.Router();
const adminLayout='../views/layouts/admin.ejs'
const post=require('../models/post');
const user=require('../models/user');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const JW_Secret=process.env.JWSecret;


//TO RETURN USERID

const  returnUserId=async(token)=>{
    try {
        const decoded=jwt.verify(token,process.env.JWSecret)
        const Userid=decoded.userID;
        const USERID= await user.findById(Userid)
        if (USERID) {
            return USERID.username}

        else{
            console.log('no user with such ID');
            return null;
        }
        
    } catch (error) {
        console.log(error);
        return null;

    }
}

// CHECK LOGIN
const authmiddleware= async (req,res,next)=>{
    const token = req.cookies.token;

    if (!token) {
       return res.redirect('/admin');
    }

    try{
        const decoded=jwt.verify(token,process.env.JWSecret);
        req.userID=decoded.userID;
        req.authorName= await returnUserId(token);
        next();
    }

    catch(error){
        return res.status(401).json({message:'unauthorized'});
    }

    
}

router.get('',(req,res)=>{

    res.render('admin/signinPage',{ title:'Admin', layout:adminLayout});

})

//LOGIN
router.post('/admin',async (req,res)=>{

    const{username,password}=req.body;
    const User= await user.findOne({username});
    
    if(!User){
       return res.status(401).json({message:'User not found'});
    }

    const isPasswordValid=await bcrypt.compare(password, User.password);

    if(!isPasswordValid){
       return res.status(401).json({message:'invalid credentials'});
    }

    const token=jwt.sign({userID: User._id},JW_Secret);
    res.cookie('token',token,{httpOnly:true});

    res.redirect('/dashboard')
})


router.get('/dashboard',authmiddleware, async (req,res)=>{

    
      try {
        
            let perpage=10; 
            let page=req.query.page||1;
    
            const data=await post.aggregate([{ $sort:{createdAt:-1}}])
            .skip(perpage*page-perpage)
            .limit(perpage)
            .exec();
    
            const count=await post.count();
            const nextPage=parseInt(page)+1;
            const hasNextPage=nextPage<=Math.ceil(count/perpage);

            console.log()

            res.render('./admin/dashboard',{title:'Dashboard' ,data,current:page, nextPage:hasNextPage ? nextPage:null});

        }
         catch (error) {
            console.log(error)
        }
}
)


//REGISTER

router.get('/register', (req, res) => {

    try {
      res.render('admin/registerPage', { title: 'Register', layout:adminLayout });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  

router.post('/register', async(req,res)=>{

    const{username,password}=req.body;
    
    try {
        const hashedPassword= await bcrypt.hash(password,10);
        const User=await user.create({username,password:hashedPassword});
        res.redirect('/');
    } catch (error) {
        if(error.code===11000){
            res.status(409).json({message:'User already exists'});
        }

        else{
            console.log(error)
            console.log('error while registering users')
            res.status(500).json({message:'Internal server error'});
        }
        
    }
})

//WRITE BLOG

router.get('/writeBlog', authmiddleware,(req,res)=>{

    res.render('writePage',{title:'Write Blog'})
    
})

router.post('/writeBlog',authmiddleware,async (req,res)=>{
        
    try {
        
        const authorname=req.authorName;
        const newPost=new post({
            title:req.body.title,
            snippet:req.body.snippet,
            body:req.body.body,
            author:authorname
        });
        console.log(newPost)
        await post.create(newPost);
        res.redirect('/dashboard');

    } catch (error) {
        console.log(error);
    }
})


//TO DELETE BLOG

router.post('/delete_post/:id', authmiddleware, async (req, res) => {
    try {

        const postId = req.params.id;
        const postData = await post.findById(postId);

        if (!postData) {
            return res.status(404).send('Post not found');
        }

        if (postData.author === req.authorName) {
            await post.deleteOne({ _id: req.params.id });
            return res.redirect('/dashboard');
        } else {
            return res.status(403).send('You are not authorized to delete this post.');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).send('Server Error');
    }

});



module.exports=router;

