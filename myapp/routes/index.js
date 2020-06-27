var express = require('express');
var multer = require('multer');
var path = require('path');

var jwt = require('jsonwebtoken');

var empModal = require('../module/employee');
var uploadModel = require('../module/uploads');


const bodyParser = require('body-parser')
 const {check,validationResult} = require('express-validator');
 const {matchedData , sanitizeBody} = require('express-validator')

var router = express.Router();

var jsonParser = bodyParser.json();
var urlencodeParser = bodyParser.urlencoded({extended:false})

 var employee = empModal.find({});
 var imgData = uploadModel.find({});

 router.use(express.static(__dirname+'./public/'));

 if(typeof localStorage === 'undefined' || localStorage === null){
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch')
 }

 function checkAuthToken(req,res,next){
     var myToken = localStorage.getItem('mytoken');
     try{
       jwt.verify(myToken,'loginToken');
     }catch(err){
       res.send("you need login to access this page....")
     }
     next();
 }


 var Storage = multer.diskStorage({
   destination:"./public/images/",
   filename : (req,file,cb)=>{
     cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))
   }
 });

 var upload = multer({
   storage : Storage
 }).single('fileUpload')

//for data fetch from db
  router.get('/',function(req,res,next){
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('Myform',{title:'Employee Records',records:data})
    })   
  })


  router.post('/',urlencodeParser,function(req,res,next){
    var empDetails = new empModal({
      name:req.body.userName,
      email:req.body.email,
      etype:req.body.etype,
      hourlyrate:req.body.hourlyrate,
      totalHour:req.body.totalHour,
      total : parseInt(req.body.hourlyrate) * parseInt(req.body.totalHour)
    });    
    empDetails.save(function(err,res1){
      if(err) throw err;
      employee.exec(function(err,data){
        if(err) throw err;
        res.render('empList',{title:'Employee Records',records:data, success:'Data inserted successfully'})
      }) 
    })      
  })


  router.get('/search',function(req,res,next){
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('search',{title:'Filter Employee Records',records:data})
    })   
  })

  router.post('/search',urlencodeParser,function(req,res,next){
    var filterName = req.body.filtrName;
    var filteremail = req.body.filtremail;
    var filterEtype = req.body.filtretype;
    
    if(filterName != '' && filteremail != '' ,filterEtype != ''){
      var filterParameter = {$and:[{name : filterName}],
      $and:[{email:filteremail},{etype:filterEtype}]
    }
    }else if(filterName != '' && filteremail == '' ,filterEtype != ''){
      var filterParameter = {$and:[{name : filterName},{etype:filterEtype}]
    }
    }else if(filterName == '' && filteremail != '' ,filterEtype != ''){
      var filterParameter = {$and:[{email : filteremail},{etype:filterEtype}]
    }
  }else{
    var filterParameter ={}
  }

  var employeeFilter = empModal.find(filterParameter);
  employeeFilter.exec(function(err,data){
        if(err) throw err;
        res.render('empList',{title:'Employee Records',records:data})
      })      
  })

  router.get('/delete/:id',function(req,res,next){
    var id = req.params.id;
    var del = empModal.findByIdAndDelete(id);
    del.exec(function(err){
      if(err) throw err;
      employee.exec(function(err,data){
        if(err) throw err;
        res.render('empList',{title:'Employee Records',records:data, success:'Data deleted successfully'})
      }) 
    })   
  })


  router.get('/edit/:id',function(req,res,next){
    var id = req.params.id;
    var edit = empModal.findById(id)
    edit.exec(function(err,data){
      console.log("records",data)
      if(err) throw err;
      res.render('edit',{title:'Edit Employee Records',records:data})
    })   
  })

  router.post('/update/',function(req,res,next){
    var update = empModal.findOneAndUpdate(res.body.id,{
      name:req.body.userName,
      email:req.body.email,
      etype:req.body.etype,
      hourlyrate:req.body.hourlyrate,
      totalHour:req.body.totalHour,
      total : parseInt(req.body.hourlyrate) * parseInt(req.body.totalHour)
    })
    update.exec(function(err,data){
      if(err) throw err;
      employee.exec(function(err,data){
        if(err) throw err;
        res.render('empList',{title:'Employee Records',records:data, success:'Data updated successfully'})
      }) 
    })  
  })

  
//for data fetch from db

//image upload
  router.get('/upload',checkAuthToken,function(req,res,next){
    imgData.exec(function(err,data){
      if(err) throw err;
      res.render('uploadImage',{title:'Upload file',records:data,success:''})
    })

  })

  router.post('/upload',upload,function(req,res,next){
    var imageFile = req.file.filename;
    var success = req.file.filename+"uploaded successfully";

    var imageDetails = new uploadModel({
      imageName : imageFile
    })

    imageDetails.save(function(err,doc){
      if(err) throw err;
      imgData.exec(function(err,data){
        if(err) throw err;
        res.render('uploadImage',{title:'Upload file',records:data ,success:success})
      })
    })
  })


  router.get('/login',function(req,res,next){
    var jwtToken = jwt.sign({name:'shilpi'},'loginToken');
    localStorage.setItem('mytoken',jwtToken)
    res.send("login successfully...")
  })

  router.get('/logout',function(req,res,next){
    localStorage.removeItem('mytoken');
    res.send("logout successfully....")
  })
//image upload

// router.use(bodyParser.urlencoded({extended:false}))
// router.use(bodyParser.json());


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Hello express world' , message : 'This is my first app' });
// });

// router.get('/about/:a-:b', function(req, res, next) {
//   console.log(req.params)
//   res.render('about', { title: 'About' , sum:req.params.a + req.params.b,
//                         sub : parseInt(req.params.a) - parseInt(req.params.b),
//                         mul : req.params.a * req.params.b
//                       });
// });

// router.get('/',urlencodeParser, function(req, res) {
//   res.render('login', { title: 'login' , message : 'User Details'});
// });

// router.post('/', urlencodeParser, [
//   check('username','username should be email id').isEmail(),
//   check('password','password must be in 5 character').isLength({min:5}),
//   check('cpassword').custom((value,{req})=>{
//       if(value!=req.body.password){
//         throw new Error ('Confirm password does not matched password')
//       }return true
//   })
// ], function(req, res) {
//   const errors = validationResult(req);
//   console.log(errors.mapped())
//   const error =errors.mapped()

//   if(!errors.isEmpty()){
//     const user = matchedData(req);
//     console.log("user",user)
//     res.render('errorLogin', { title: 'User Details', problem : error,user:user});
//   }else{
//     const user = matchedData(req);
//     res.render('userDetail',{title:"users Details",user:user})
//   }

// });    

module.exports = router;
