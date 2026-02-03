const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({createdBy: req.user.userId}).sort('createdAt');
  res.status(StatusCodes.OK).json({jobs, count: jobs.length});
}

const getJob = async (req, res) => {
  const { id } = req.params;
  if(!id){
    throw new BadRequestError("Please provide job id");
  }
  const job = await Job.findOne({createdBy: req.user.userId, _id: id}).sort('createdAt');
  if(!job){
    throw new NotFoundError(`No job with id : ${id}`);
  }
  res.status(StatusCodes.OK).json({job});
}

const createJob = async (req, res) => {  
  req.body.createdBy = req.user.userId;
  const {company, position, createdBy} = req.body;
  if(!company || !position || !createdBy){
    throw new BadRequestError("Please provide all required fields");
  }
  const job = await Job.create({company, position, createdBy});
  res.status(StatusCodes.CREATED).json({job});  
}

const updateJob = async (req, res) => {
  const { id } = req.params;
  if(!id){
    throw new BadRequestError("Please provide job id");
  }
  const {status, company, position,} = req.body;
  const userId = req.user.userId;
  if(!status){
    // throw new BadRequestError("Please provide status field to update");
    return res.status(StatusCodes.BAD_REQUEST).json({msg: "Please provide status field to update"});
    ;
    //
    // throw new BadRequestError("Please provide status field to update");
  }
  const jobUpdateData = {
    status
  }
  if(company){
    jobUpdateData.company = company;
  }
  if(position){
    jobUpdateData.position = position;
  }
  const job = await Job.findOneAndUpdate({createdBy: userId, _id: id}, jobUpdateData, {new: true, runValidators: true});
  if(!job){
    return res.status(StatusCodes.NOT_FOUND).json({msg: `No job with id : ${id}`});
    // throw new NotFoundError(`No job with id : ${id}`);
  }
  res.status(StatusCodes.OK).json({job});
}

const deleteJob = async (req, res) => {
  const { id } = req.params;
  if(!id){
    throw new BadRequestError("Please provide job id");
  }
  const job = await Job.findOneAndDelete({createdBy: req.user.userId, _id: id});
  if(!job){
    return res.status(StatusCodes.NOT_FOUND).json({msg: `No job with id : ${id}`});
    // throw new NotFoundError(`No job with id : ${id}`);
  }
  res.status(StatusCodes.OK).json({msg: "Job deleted successfully"});
}


module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
  };  