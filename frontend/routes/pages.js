const express = require("express");
const router =express.Router();
const userController=require('../controllers/users');
const mysql = require("mysql");
const db=mysql.createConnection({
   host: process.env.DATABASE_HOST,
   user: process.env.DATABASE_USER,
   password: process.env.DATABASE_PASS,
   database: process.env.DATABASE,
});

router.get(["/","/home"],userController.isLoggedIn,(req,res)=>{
 //console.log(req.name);
 if(req.user){ 
    res.render("home",{ user:req.user}); 
 }else{
    res.redirect("/index");
 } 
});

router.get("/register",(req,res)=>{
    res.render("register");
});
router.get("/dashboard", userController.isLoggedIn, (req, res) => {
   if (req.user) {
       // If the user is logged in, fetch the products data and render the dashboard
       db.query("SELECT * FROM products", (err, rows) => {
           if (err) {
               console.error('Error fetching data:', err);
               res.status(500).send('Internal Server Error');
           } else {
               res.render('dashboard', { user: req.user, rows });
           }
       });
   } else {
       // If the user is not logged in, redirect to the login page
       res.redirect("/index");
   }
});


router.get("/form",userController.isLoggedIn,(req,res)=>{
    if(req.user){ 
        res.render("form", { user: req.user }); 
     }else{
        res.redirect("/index");
     } 
});

router.get("/profile",userController.isLoggedIn,(req,res)=>{
    if(req.user){ 
        res.render("profile", { user: req.user }); 
     }else{
        res.redirect("/index");
     } 
});
router.get("/index",(req,res)=>{
    res.render("index");
});
router.get("/about",(req,res)=>{
   res.render("about");
});
router.get(["/","/dashboard1"],userController.isLoggedIn,(req,res)=>{
   //console.log(req.name);
   if(req.user){ 
      res.render("dashboard1",{ user:req.user}); 
   }else{
      res.redirect("/index");
   } 
  });

router.get(["/","/contact"],userController.isLoggedIn,(req,res)=>{
   //console.log(req.name);
   if(req.user){ 
      res.render("contact",{ user:req.user}); 
   }else{
      res.redirect("/index");
   } 
  });
// Assuming router is your Express router
router.get("/dashboard/:id", userController.isLoggedIn, (req, res) => {
   const productId = req.params.id;
   db.query("DELETE FROM products WHERE id = ?", [productId], (err, result) => {
       if (err) {
           console.error('Error deleting product:', err);
           res.status(500).send('Internal Server Error');
       } else {
           // Redirect back to the dashboard page after deletion
           res.redirect("/dashboard");
       }
   });
});


module.exports = router;