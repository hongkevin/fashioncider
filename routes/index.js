var express = require('express');
var router = express.Router();

var db = require('../models/db');
require('../models/postmodel');
var PostModel = db.model('Post');


/* 이미지 업로드 셋팅!!! */
var multer = require('multer');
var multerS3 = require('multer-s3');
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-1';
var s3 = new AWS.S3();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express!!!!' });
});

router.post('/api/1/filter', function(req, res, next) {
	var gender = req.body.gender;
	var age = req.body.age;
	var height = req.body.height;
	var weight = req.body.weight;

	var end_age = parseInt(age) + 9;
	var end_height = parseInt(height) + 9;

	var req_now_page = req.body.now_page;
	var req_total_page = req.body.total_page;
	var per_page = 5;

	function isNaturalNumber (str) {
    var pattern = /^(0|([1-9]\d*))$/;
    return pattern.test(str);
  }

	// 필터 함수 시작
	var filterFunc = function(gender, age, height, weight, now_page, message) {
		if (gender == 0 && age == 0 && height == 0 && weight == 0) {
			PostModel.paginate({post_id: {$gte: 1}}, {sort: {post_id: -1}, limit: per_page, page: now_page}, function(err, docs) {
				if (err) { return next(err); }

				var data = [];
				docs.docs.forEach(function(doc) {
					data.push({
						post_id: doc.post_id,
						blogger_name: doc.blogger_name,
						introduction: doc.introduction,
						img_url: doc.img_url
					});
				});

				var total_page = Math.ceil(docs.total / docs.limit);
				var now_page = docs.page;

				res.json({
					success: 1,
					message: message,
					now_page: now_page,
					total_page: total_page,
					data: data
				});
			});
		} else {
			var condition = {
				gender : gender,
				age : {$gte: age, $lte: end_age},
				height : {$gte: height, $lte: end_height},
				weight : weight
			}

			if (gender == 0) { delete condition.gender; }
			if (age == 0) { delete condition.age; }
			if (height == 0) { delete condition.height; }
			if (weight == 0) { delete condition.weight; }

			PostModel.paginate({$and: [condition]}, {sort: {post_id: -1}, limit: per_page, page: now_page}, function(err, docs) {
				if (err) { return next(err); }

				var data = [];
				docs.docs.forEach(function(doc) {
					data.push({
						post_id: doc.post_id,
						blogger_name: doc.blogger_name,
						introduction: doc.introduction,
						img_url: doc.img_url
					});
				});

				if (data.length == 0) {
					res.json({ success: 0, message: "조건에 맞는 검색결과가 없습니다." });
				} else {
					var total_page = Math.ceil(docs.total / docs.limit);
					var now_page = docs.page;

					res.json({
						success: 1,
						message: message,
						now_page : now_page,
						total_page : total_page,
						data: data
					});
				} 
			});
		}
	}  

  if (req_now_page == undefined && req_total_page == undefined) {
		console.log('ddd');
    resultMessage = "최상단 블로거리스트입니다.";
    filterFunc(gender, age, height, weight, 1, resultMessage);
  } else if (isNaturalNumber(req_now_page) && isNaturalNumber(req_total_page)) {
    if (req_now_page == req_total_page) {
      res.json({ success: 0, message: "더 가져올 블로거리스트가 없습니다." });
    } else if (req_now_page < req_total_page) {
			console.log('eee');
      var new_page = parseInt(req_now_page) + 1;
      resultMessage = "블로거리스트 더 불러오기입니다.";
      filterFunc(gender, age, height, weight, new_page, resultMessage);
    } else {
      res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page보다 now_page가 더 큰 숫자)" });
    }
  } else {
    res.json({ success: 0, message: "옳지 않은 요청입니다.(total_page와 now_page가 이상한 숫자)" });
  } 
});

router.get('/api/1/posts/:post_id', function(req, res, next) {
	var post_id = req.params.post_id;

	PostModel.findOne({post_id: post_id}, function(err, docs) {
		if (err) { return next(err); }
		var data = {
			post_id: docs.post_id,
			blogger_name: docs.blogger_name,
			introduction: docs.introduction,
			gender: docs.gender,
			age: docs.age,
			height: docs.height,
			weight: docs.weight,
			img_url: docs.img_url,
			post_url: docs.post_url,
			outer: docs.outer,
			top_wear: docs.top_wear,
			down_wear: docs.down_wear,
			shoes: docs.shoes,
			bag: docs.bag
		};

		res.json({
			success: 1,
			message: "특정포스팅 상세보기입니다.",
			data: data
		});
	});
});




var upload = multer({
  storage: multerS3({
    s3 : s3,
    bucket : 'fashioncider',
    acl : 'public-read',
    key : function(req, file, callback) {
      var tmp = file.mimetype.split('/')[1]; // file.mimetype을 뽑아낸 뒤 확장자를 추출
      if (tmp == 'jpeg') { tmp = 'jpg' }
      var ext = "." + tmp;
      var keyword = "Dress_Post_";
      var newname = keyword + Date.now().toString() + ext; // 일단은 이렇게 하고 동일 시간에 올라가면서 중복되면 uuid로 보완
      callback(null, newname);
    }
  })
});

router.post('/api/1/posts', upload.single('img'), function(req, res, next) {
	var blogger_name = req.body.blogger_name;
	var introduction = req.body.introduction;
	var gender = req.body.gender;
	var age = req.body.age;
	var height = req.body.height;
	var weight = req.body.weight;
	var img_url = req.file.location;
	var post_url = req.body.post_url;

	var outer = req.body.outer;
	var top_wear = req.body.top_wear;
	var down_wear = req.body.down_wear;
	var shoes = req.body.shoes;
	var bag = req.body.bag;
	
	var data = new PostModel({
		blogger_name : blogger_name,
		introduction : introduction,
		gender : gender,
		age : age,
		height : height,
		weight : weight,
		img_url : img_url,
		post_url : post_url,
		outer : outer,
		top_wear : top_wear,
		down_wear : down_wear,
		shoes : shoes,
		bag : bag
	});

	data.save(function(err, doc) {
		if (err) { return next(err); }
		res.json({ success: 1, message: "사진이 업로드되었습니다" });
	});
});

module.exports = router;
