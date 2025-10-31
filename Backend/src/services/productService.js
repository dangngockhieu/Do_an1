'use strict';
import { hashUserPassword, generateToken, checkEmailExist } from './utilService.js';
import { ROLE_USER } from '../config/constant.js';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import crypto from "crypto";
import transporter from '../config/mailer.js';
import prisma from '../lib/prisma.js';
import 'dotenv/config'

// Tạo product mới
const postProduct = async (name, originalPrice, image,
  detailDesc, shortDesc, quantity, warranty, infor,
  cpu, ram, storage, screen, graphicsCard, os,
  battery, weight, releaseYear, categoryID, factoryID) => {
  try {


    // Ép kiểu và chuẩn hoá một số trường
    // const categoryId = +categoryID;
    // const factoryId = +factoryID;
    // const originalPrice = +originalPrice;
    // const price = price ? +price : null;
    // const coupon = coupon ? +coupon : null;
    // const quantity = +quantity;
    // const sold = sold ? +sold : 0;
    // const releaseYear = +releaseYear;

    // Kiểm tra category và factory tồn tại 
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return { EC: -1, EM: `Category with id ${categoryId} not found` };
    }
    const factory = await prisma.factory.findUnique({ where: { id: factoryId } });
    if (!factory) {
      return { EC: -1, EM: `Factory with id ${factoryId} not found` };
    }
    // Tạo product và connect quan hệ
    const product = await prisma.product.create({
      data: {
        name: name,
        originalPrice: originalPrice,
        price: price,
        coupon: coupon,
        image: image,
        detailDesc: detailDesc,
        shortDesc: shortDesc,
        quantity: quantity,
        sold: sold,
        warranty: warranty,
        infor: infor,
        cpu: cpu,
        ram: ram,
        storage: storage,
        screen: screen,
        graphicsCard: graphicsCard,
        os: os,
        battery: battery,
        weight: weight,
        releaseYear: releaseYear,
        categoryID: categoryId,
        factoryID: factoryId
      }
    });
    return { EC: 0, EM: 'post product succeed', DT: product };
  } catch (err) {
    return { EC: -1, EM: err.message };
  }
}


// Xóa product theo id
const deleteProduct = async (productId) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: +productId } });
    if (!product) {
      return { EC: -1, EM: 'Product not found' };
    }
    await prisma.product.delete({ where: { id: +productId } });
    return { EC: 0, EM: 'Delete product succeed' };
  } catch (err) {
    return { EC: -1, EM: err.message };
  }
}

// update export to include deleteProduct


// Cập nhật product
const updateProduct = async (productId, updateData) => {
  try {
    // Các trường cho phép cập nhật
    const allowed = ['name', 'originalPrice', 'price', 'coupon', 'image', 'detailDesc', 'shortDesc', 'quantity', 'sold', 'warranty', 'infor', 'cpu', 'ram', 'storage', 'screen', 'graphicsCard', 'os', 'battery', 'weight', 'releaseYear', 'categoryID', 'factoryID'];
    const dataToUpdate = {};

    for (const key of Object.keys(updateData)) {
      if (allowed.includes(key)) {
        // Ép kiểu số cho các trường hợp cần thiết về number
        if (['originalPrice', 'price', 'coupon', 'quantity', 'sold', 'releaseYear', 'categoryID', 'factoryID'].includes(key)) {
          dataToUpdate[key] = +updateData[key];
        } else {
          dataToUpdate[key] = updateData[key];
        }
      }
    }

    if (Object.keys(dataToUpdate).length === 0) return { EC: -1, EM: 'No valid fields to update' };

    // Xử lí categoryID hoặc factoryID nếu có, kiểm tra tồn tại
    if (dataToUpdate.categoryID) {
      const category = await prisma.category.findUnique({
        where: { id: dataToUpdate.categoryID }
      });
      if (!category) return { EC: -1, EM: `Category with id ${dataToUpdate.categoryID} not found` };
    }
    if (dataToUpdate.factoryID) {
      const factory = await prisma.factory.findUnique({
        where: { id: dataToUpdate.factoryID }
      });
      if (!factory) return { EC: -1, EM: `Factory with id ${dataToUpdate.factoryID} not found` };
    }

    // Cập nhật product
    const updated = await prisma.product.update({
      where: { id: +productId }, data: dataToUpdate
    });

    return { EC: 0, EM: 'Update product succeed', DT: updated };
  } catch (err) {
    return { EC: -1, EM: err.message };
  }
}

export default {
  postProduct, deleteProduct, updateProduct
};