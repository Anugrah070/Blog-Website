const express=require('express');
const post=require('../models/post');

const router=express.Router();


// router.get('',(req,res)=>{
//     res.redirect('/admin')
// })


//Routes
// router.get("", async(req,res)=>{
    
//     try {

//         let perpage=10;  
//         let page=req.query.page||1;

//         const data=await post.aggregate([{ $sort:{createdAt:-1}}])
//         .skip(perpage*page-perpage)
//         .limit(perpage)
//         .exec();

//         const count=await post.count();
//         const nextPage=parseInt(page)+1;
//         const hasNextPage=nextPage<=Math.ceil(count/perpage);

       
//         res.render('home',{title:'Home',data ,current:page, nextPage:hasNextPage ? nextPage:null});

//     } catch (error) {
//         console.log(error)
//     }
    
// })

router.get("/about",(req,res)=>{
    res.render('about',{title:'About'})
})



//GET POST PAGE

router.get("/post/:id", async(req,res)=>{
    try {
        const postid=req.params.id;
        const data= await post.findById(postid)
        
        res.render('postpage',{title:'Post',data,postid})
    } catch (error) {
        console.log(error)
    }
   
})

router.post("/search", async(req,res)=>{

    try {

        let searchTerm=req.body.searchTerm;
        const searchNoSpecialChar= searchTerm.replace(/[^a-zA-Z0-9]/g,"")
        const data=await post.find(
            {
                $or:[{title:{$regex:new RegExp(searchNoSpecialChar,'i')}},
                      {body:{$regex:new RegExp(searchNoSpecialChar,'i')}}]
            }
        )

        res.render('searchPage',{title:"search", data})
        
    } catch (error) {

        console.log(error);
    }
})



module.exports=router