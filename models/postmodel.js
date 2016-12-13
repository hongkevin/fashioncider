var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var mongoosePaginate = require('mongoose-paginate');

var uri = 'mongodb://localhost/dress';
var options = { server: { poolSize: 100 } };
var db = mongoose.createConnection(uri, options);

autoIncrement.initialize(db);

var PostScheme = new mongoose.Schema({
  post_id : Number, // auto_increment 1부터
  blogger_name : String, // foreign_key와 같은 형태
  introduction : String,
  gender : Number, // 1: 남자, 2: 여자
  age : Number, // 28
  height : Number, // 171
  weight : Number, // 1: 날씬, 2: 마른, 3: 통통
  img_url : String, // AWS S3 주소
  post_url : String,
  outer : String,
  top_wear : String,
  down_wear : String,
  shoes : String,
  bag : String
});

PostScheme.plugin(autoIncrement.plugin, {
  model: 'Post',
  field: 'post_id',
  startAt: 1,
  incrementBy: 1
});

PostScheme.plugin(mongoosePaginate);

mongoose.model('Post', PostScheme);

