import axios from 'axios';
import constants from '../constants';

const headers = { 
    headers: { 
      'Content-Type': 'application/json'
    }
}

export const getAllData = async (start, end, sortFilter) => {
    return await axios.get(constants.getData + `${start}:${end}${sortFilter}`,"",headers)
}
export const getSortedData = async (start, end,sortFilter) => {
    return await axios.get(constants.getData + `${start}:${end}${sortFilter}`,"",headers)
}