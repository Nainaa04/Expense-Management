import React,{useState,useEffect} from 'react'
import {Modal,Form,Input, Select, message, Table, DatePicker} from 'antd';
import axios from 'axios';
import {UnorderedListOutlined,AreaChartOutlined,EditOutlined,DeleteOutlined} from '@ant-design/icons';
import Layout from '../components/Layout/Layout'
import Spinner from './../components/Spinner';
import moment from 'moment';
import Analytics from '../components/Analytics';
const {RangePicker} =DatePicker;
const HomePage=()=>{
    const [showModal,setShowModal]=useState(false);
    const [loading,setLoading]=useState(false);
    const [allTransaction,setAllTransaction]=useState([]);
    const [frequency,setFrequency]=useState('7');
    const [selectedDate,setSelectedate]=useState([]);
    const [type,setType]=useState('all');
    const [viewData,setViewData]=useState('table');
    const [editable,setEditable]=useState(null);
    //table data
    const columns=[
        {
            title:'Date',
            dataIndex:'date',
            render:(text)=><span>{moment(text).format("YYYY-MM-DD")}</span>
        },
        {
            title:'Amount',
            dataIndex:'amount'
        },
        {
            title:'Type',
            dataIndex:'type'
        },
        {
            title:'Category',
            dataIndex:'category'
        },
        {
            title:'Reference',
            dataIndex:'reference'
        },
        {
            title:'Actions',
            render:(text,record)=>(
                <div>
                    <EditOutlined onClick={()=>{
                        setEditable(record)
                        setShowModal(true)
                    }}/>
                    <DeleteOutlined className="mx-2" onClick={()=>{handleDelete(record)}}/>
                </div>
            )
        },
    ]

    //get all transactions
    useEffect(() => {
        const getAllTransactions = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                setLoading(true);
                const res = await axios.post('http://localhost:8080/api/v1/transactions/get-transaction', {
                    userid: user._id,
                    frequency,
                    selectedDate,
                    type,
                });
                setLoading(false);
                setAllTransaction(res.data);
                console.log("Data for Table:", res.data); // Update table data
            } catch (error) {
                setLoading(false);
                message.error('Fetch Issue with Transactions');
            }
        };
        getAllTransactions();
    }, [frequency, selectedDate,type]);

    //DELETE HANDLER
    const handleDelete=async(record)=>{
        try{
            setLoading(true);
            await axios.post("http://localhost:8080/api/v1/transactions/delete-transaction",{transactionId:record._id});
            setLoading(false);
            message.success('Transaction Deleted Successfully')
        }catch(error){
            setLoading(false);
            console.log(error);
            message.error('unable to delete');
        }
    }
    
    const handleSubmit=async(values)=>{
        try{
            const user=JSON.parse(localStorage.getItem('user'))
            setLoading(true)
            if(editable){
                // const baseURL = "http://localhost:8080";
                await axios.post("http://localhost:8080/api/v1/transactions/edit-transaction",{
                    payload:{
                        ...values,
                        userId:user._id
                    },
                    transactionId:editable._id
                });
            setLoading(false)
            message.success('Transaction Updated Successfully');
            console.log('Transaction Response:', values);
            }else{
                await axios.post('http://localhost:8080/api/v1/transactions/add-transaction',{...values,userid:user._id})
            setLoading(false)
            message.success('Transaction Added Successfully');
            console.log('Transaction Response:', values);
            }
            setShowModal(false)
            setEditable(null)
        }catch(error){
            setLoading(false);
            message.error('Failed to add Transaction')
        }
    }
    return(
        <Layout>
            {loading && <Spinner/>}
        <div className="filters">
            <div>
                <h6>Select Frequency</h6>
                <Select value={frequency} onChange={(values)=> setFrequency(values)}>
                    <Select.Option value="7">Last 1 Week</Select.Option>
                    <Select.Option value="30">Last 1 Month</Select.Option>
                    <Select.Option value="365">Last 1 Year</Select.Option>
                    <Select.Option value="custom">Custom</Select.Option>
                </Select>
                {frequency === 'custom' && (
                    <RangePicker
                        value={selectedDate.length ? selectedDate.map((d) => moment(d)) : []}
                        onChange={(values) => {
                           if (values) {
                                setSelectedate(values.map((date) => date.format("YYYY-MM-DD")));
                        }  else {
                                setSelectedate([]);
                        } 
                    }}
                />
                )}
            </div>
            <div>
                <h6>Select Type</h6>
                <Select value={type} onChange={(values)=> setType(values)}>
                    <Select.Option value="all">All</Select.Option>
                    <Select.Option value="income">Income</Select.Option>
                    <Select.Option value="expense">Expense</Select.Option>
                </Select>
                {frequency === 'custom' && (
                    <RangePicker
                        value={selectedDate.length ? selectedDate.map((d) => moment(d)) : []}
                        onChange={(values) => {
                           if (values) {
                                setSelectedate(values.map((date) => date.format("YYYY-MM-DD")));
                        }  else {
                                setSelectedate([]);
                        } 
                    }}
                />
                )}
            </div>
            <div className="switch-icons">
                    <UnorderedListOutlined 
                    className={`mx-2 ${viewData==='table' ? 'active-icon' : 'inactive-icon'}`} 
                    onClick={()=> setViewData('table')}/>
                    <AreaChartOutlined className={`mx-2 ${viewData==='analytics' ? 'active-icon' : 'inactive-icon'}`}  
                    onClick={()=> setViewData('analytics')}/>
                </div>
            <div>
                <button className="btn btn-primary" onClick={()=>setShowModal(true)} >Add New</button>
            </div>
        </div>
        <div className="content">
            {viewData=== 'table'?(<Table columns={columns} dataSource={allTransaction} rowKey={(record) => record.id || record._id}/>)
            :(<Analytics allTransaction={allTransaction}/>)}
            
            
        </div>
        <Modal title={editable ? 'Edit Transaction' : 'Add Transaction'}
        open={showModal}
          onCancel = {()=>setShowModal(false)}
          footer={false}>
            <Form layout="vertical" onFinish={handleSubmit} initialValues={
                {
                    ...editable,
                    date: editable ? moment(editable.date).format("YYYY-MM-DD") : null, // Format the date
                  }
            }>
                <Form.Item label="Amount" name="amount">
                    <Input type="text"/>
                </Form.Item>
                <Form.Item label="type" name="type">
                    <Select>
                        <Select.Option value="income">Income</Select.Option>
                        <Select.Option value="expense">Expense</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Category" name="category">
                    <Select>
                        <Select.Option value="Salary">Salary</Select.Option>
                        <Select.Option value="Tip">Tip</Select.Option>
                        <Select.Option value="Project">Project</Select.Option>
                        <Select.Option value="Food">Food</Select.Option>
                        <Select.Option value="Movie">Movie</Select.Option>
                        <Select.Option value="Bills">Bills</Select.Option>
                        <Select.Option value="Medical">Medical</Select.Option>
                        <Select.Option value="Fee">Fee</Select.Option>
                        <Select.Option value="Tax">TAX</Select.Option>
                        <Select.Option value="Others">Others</Select.Option>                        
                    </Select>
                </Form.Item>
                <Form.Item label="Date" name="date">
                    <Input type="date"/>
                </Form.Item>
                <Form.Item label="Reference" name="reference">
                    <Input type="text"/>
                </Form.Item>
                <Form.Item label="Description" name="description">
                    <Input type="text"/>
                </Form.Item>
                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary">
                        SAVE
                    </button>
                </div>   
            </Form>


        </Modal>
        </Layout>
    )
}
export default HomePage 