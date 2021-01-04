import React, { Component } from "react";
import "../assets/styles/custom/Dashboard.scss";
import constants from "../constants"
import { HeartTwoTone, PicCenterOutlined, MenuOutlined, SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Card, Pagination, Row, Col, Button, Tabs, Divider, Empty } from "antd";
const { TabPane } = Tabs;
import { getAllData } from "../config/axios"
import checkedPNG from '../assets/images/checked.png'
import uncheckedPNG from '../assets/images/unchecked.png'

const sortFilter = ""
export default class Dashboard extends Component {
	state = {
		title:'',
		totalCount: 0,
		minValue: 0,
		currentPagination: 1,
		maxValue: 10,
		paginationSize: 10,
		colSpan: 12,
		data: [],
		sorts: [],
		aggregations: [],
		sortVisible: false,
		filterVisible: false
	};

	async componentDidMount() {
		try {
			await getAllData(0, 10, "").then(response => {
				let sorts = this.state.sorts
				let aggregations = this.state.aggregations
				if (sorts.length < 1 && aggregations.length < 1) {
					sorts = response.data.data.sorts
					aggregations = response.data.data.aggregations
				}
				this.setState({ data: response.data.data.products, totalCount: response.data.data.totalCount, sorts, aggregations, title: response.data.data.title });
			})
		} catch (error) {
			console.error(error);
		}
	}

	handleChange = async value => {
		if (value > this.state.data.length / this.state.paginationSize) {
			await getAllData(this.state.data.length, this.state.paginationSize, sortFilter).then(response => {
				let tempData = this.state.data
				tempData.push(...response.data.data.products)
				this.setState({
					data: tempData, 
					totalCount: response.data.data.totalCount,
					minValue: this.state.paginationSize * (value - 1), 
					maxValue: this.state.paginationSize * value,
					title: response.data.data.title
				});
			})
		} else {
			this.setState({ minValue: this.state.paginationSize * (value - 1), maxValue: this.state.paginationSize * value });
		}
	};

	sortClick = () => {
		this.setState({ sortVisible: !this.state.sortVisible })
	}

	sortOptionClick = async (selected) => {
		try {
			let sortFilter = `&sort=${selected.key}:${selected.order}`
			await getAllData(0, 10, sortFilter).then(response => {
				let tempData = this.state.data
				tempData = response.data.data.products
				this.setState({
					data: tempData,
					totalCount: response.data.data.totalCount,
					sortVisible: false,
					currentPagination: 1,
					minValue: 0,
					maxValue: 10,
					title: response.data.data.title
				});
			})
		} catch (error) {
			console.error(error);
		}
	}

	filterClick = () => {
		this.setState({ filterVisible: !this.state.filterVisible, sortVisible: false })
	}

	displayOption = () => {
		if (this.state.colSpan == 24) {
			this.setState({ colSpan: 12 })
		} else {
			this.setState({ colSpan: 24 })
		}
	}

	filterOptionClick = (key_index, item_index, multiSelect) => {
		let aggregations = this.state.aggregations
		let element = aggregations[key_index]
		let element_item = element.buckets[item_index]
		if (multiSelect) {
			element_item.isSelected = !element_item.isSelected
		} else {
			element.buckets.map(v => v.isSelected = (v.key === element_item.key ? true: false) )
		}
		this.setState({ aggregations })
	}

	applyFilter = async () => {
		try {
			let filter = ''
			for (const item of this.state.aggregations) {
				let sub_filter = []
				for (const bucket of item.buckets) {
					if (bucket.isSelected) {
						if (bucket.key.includes('-')) {
							let split = bucket.key.split('-')
							if (typeof parseInt(split[0]) === "number" && !isNaN(parseFloat(split[0]))) {
								sub_filter.push(split.map(v => parseInt(v)).join('%3A'))
							} else {
								sub_filter.push(bucket.key)
							}
						} else {
							sub_filter.push(bucket.key)
						}
					}
				}
				if (sub_filter.length > 0) {
					filter += `&${item.name}=${sub_filter.join(',')}`
				}
			}
			
			await getAllData(0, 10, filter).then(response => {
				let tempData = this.state.data
				tempData = response.data.data.products

				let aggregations = this.state.aggregations
				let updatedAggregation = response.data.data.aggregations

				for (let item of aggregations) {
					for (const updated_item of updatedAggregation) {
						if (item.name === updated_item.name) {
							item = updated_item
						}
					}
				}

				this.setState({
					data: tempData,
					totalCount: response.data.data.totalCount,
					filterVisible: false,
					currentPagination: 1, minValue: 0, maxValue: 10,
					aggregations,
					title: response.data.data.title
				});
			})
		} catch (error) {
			console.error(error);
		}
	}

	clearAll = () => {
		try {
			let aggregations = this.state.aggregations
			for (const item of aggregations) {
				for (const bucket of item.buckets) {
					bucket.isSelected = false
				}
			}
			this.setState({ aggregations })
		} catch (error) {
			console.error(error);
		}
	}

	render() {
		// console.log(this.state);
		return (
			<React.Fragment>
				<span className={!this.state.filterVisible ? "visible" : "hidden"}>
					<div className="header">
						<div className="logo" >
							<div className="icons">
								<MenuOutlined />
								<img src={constants.logo} />
							</div>
							<div className="icons">
								<SearchOutlined />
								<ShoppingCartOutlined />
							</div>
						</div>
						<div className="title">
							<p style={{fontWeight:'bold'}}>{this.state.title}</p>
							<p>-</p>
							<p>{this.state.totalCount}</p>
						</div>
						<div className="filter-option">
							<Button icon={<PicCenterOutlined />} onClick={() => this.displayOption()} />
							<Button type="ghost" onClick={() => this.sortClick()}>Sort </Button>
							<Button type="ghost" onClick={() => this.filterClick()}>Filter </Button>
						</div>
					</div>
					<div className="site-card-wrapper">
						<Row gutter={16}>
							{
								this.state.data &&
								this.state.data.length > 0 ?
								<React.Fragment>
									{
										this.state.data.slice(this.state.minValue, this.state.maxValue).map((val, index) => (
											<Col span={this.state.colSpan}>
												<Card bordered={true}>
													<div><HeartTwoTone twoToneColor="#eb2f96" /></div>
													<img src={val.skuImageUrl} />
													<p className="product-name">{val.skuName}</p>
													<div>
														<p className="product-price">₹ {val.defaultPrice}</p>&nbsp;
														{val.skuDiscPercentage > 0 ? <p className="product-price-original">₹ {val.listPrice}</p> : ""}
													</div>
												</Card>
											</Col>
										))
									}
									<Pagination
										defaultCurrent={this.state.currentPagination}
										defaultPageSize={this.state.paginationSize}
										onChange={this.handleChange}
										total={this.state.totalCount}
									/>
								</React.Fragment>
								:
								<Empty description={
									<span>
										No Products Available
									</span>
								}/>
							}
						</Row>
					</div>

				</span>
				<div className={this.state.sortVisible ? "sort-option-div visible" : "sort-option-div hidden"}>
					<ul>
						{this.state.sorts &&
							this.state.sorts.length > 0 &&
							this.state.sorts.map(val => (
								val.orders.map(element => {
									return <li onClick={() => this.sortOptionClick(element)}>{element.text}</li>
								})
							))}
						<li onClick={() => this.sortClick()}>Close</li>
					</ul>
				</div>
				<div className={this.state.filterVisible ? "filter-option-div visible" : "filter-option-div hidden"}>
					<div className="filter-header">
						<div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 20px 0 20px'}}>
							<p onClick={() => this.setState({ filterVisible: !this.state.filterVisible }, () => { this.clearAll()})} style={{ fontWeight: 'bold', fontSize: 25, color: 'orange', cursor: 'pointer', margin: 0 }}>X</p>
							<p>Filter by</p>
							<p style={{ color: 'orange', cursor: 'pointer', margin: 0 }} onClick={this.clearAll}>Clear All</p>
						</div>
						<Divider />
					</div>
					<Tabs defaultActiveKey="1" tabPosition="left" style={{ height: '100%' }}>
						{
							this.state.aggregations &&
							this.state.aggregations.length > 0 &&
							this.state.aggregations.map((element, ele_index) => (
								<TabPane tab={`${element.text}`} key={ele_index}>
									{
										<React.Fragment>
											{
												element.buckets.map((item, val_index) => (
													<div className="filter-sub-option-container">
														<div
															onClick={() => this.filterOptionClick(ele_index, val_index, element.isForMultiSelection)}
															className="checkedbutton"
														>
															<div style={{display:'flex'}}>
																<p>{item.text}</p>
																<p>{item.showDocCount ? `(${item.docCount})` : ''}</p>
															</div>
															{
																item.isSelected ? <img src={checkedPNG} /> : <img src={uncheckedPNG} />
															}
														</div>
													</div>
												))
											}
										</React.Fragment>
									}
								</TabPane>
							))}
					</Tabs>
					<Button type="primary" style={{ width: '100%', background: 'orange', border: 0, textAlign: 'center', position:'sticky', bottom: 0 }} onClick={this.applyFilter}>Apply</Button>
				</div>
			</React.Fragment>
		);
	}
}