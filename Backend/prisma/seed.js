import { PrismaClient } from "@prisma/client";
import argon from "argon2";

const prisma = new PrismaClient();

const main = async () => {
  console.log(" Bắt đầu seed dữ liệu...");

  // ========== USERS ==========
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    console.log("👤 Tạo người dùng mẫu...");
    const passwordHash = await argon.hash("123456");
    await prisma.user.createMany({
      data: [
        { name: "Admin", email: "admin@gmail.com", password: passwordHash, role: "ADMIN", isVerified: true },
        { name: "User", email: "user@gmail.com", password: passwordHash, role: "USER", isVerified: true },        
        { name: "Nguyễn Văn A", email: "a@gmail.com", password: passwordHash, role: "USER", isVerified: true },
        { name: "Trần Thị B", email: "b@gmail.com", password: passwordHash, role: "USER", isVerified: true },
        { name: "Lê Văn C", email: "c@gmail.com", password: passwordHash, role: "USER", isVerified: true }, 
      ],
    });
  }

  const users = await prisma.user.findMany();

  // ========== FEATURES ==========
  const featureCount = await prisma.feature.count();
  if (featureCount === 0) {
    console.log(" Tạo các tính năng Laptop...");
    await prisma.feature.createMany({
      data: [
        { name: "Văn phòng" },
        { name: "Gaming" },
        { name: "Mỏng nhẹ" },
        { name: "Đồ họa" },
        { name: "Cảm ứng" },
        { name: "Laptop AI" },
        { name: "Điện thoại 5G" },
        { name: "Điện thoại AI"},
        { name: "Gaming Phone"},
        { name: "Phổ thông 4G"},
        { name: "Điện thoại gập"}
      ],
    });
  }

  const features = await prisma.feature.findMany();

  // ========== PRODUCTS ==========
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    console.log(" Tạo sản phẩm mẫu...");

    // ===== 5 Laptop =====
    await prisma.product.createMany({
      data: [
        {
          name: "Dell Inspiron 15",
          originalPrice: 20000000,
          price: 18000000,
          coupon: 10,
          quantity: 20,
          warranty: "12 tháng",
          infor: "Laptop học tập và làm việc hiệu năng tốt.",
          cpu: "Intel Core i5",
          ram: "8GB",
          storage: "512GB SSD",
          screen: "15.6 inch Full HD",
          graphicsCard: "Intel Iris Xe",
          battery: "56Wh",
          weight: "1.7kg",
          releaseYear: "2024",
          category: "LAPTOP",
          factory: "DELL",
        },
        {
          name: "HP Pavilion 14",
          originalPrice: 19000000,
          price: 17000000,
          coupon: 10,
          quantity: 25,
          warranty: "12 tháng",
          infor: "Thiết kế nhỏ gọn, tiện lợi di chuyển.",
          cpu: "Intel Core i7",
          ram: "16GB",
          storage: "512GB SSD",
          screen: "14 inch Full HD",
          graphicsCard: "Intel Iris Xe",
          battery: "50Wh",
          weight: "1.5kg",
          releaseYear: "2024",
          category: "LAPTOP",
          factory: "HP",
        },
        {
          name: "ASUS TUF Gaming F15",
          originalPrice: 25000000,
          price: 23000000,
          coupon: 8,
          quantity: 15,
          warranty: "24 tháng",
          infor: "Laptop gaming hiệu năng mạnh mẽ, bền bỉ.",
          cpu: "Intel Core i7",
          ram: "16GB",
          storage: "1TB SSD",
          screen: "15.6 inch Full HD",
          graphicsCard: "RTX 4060",
          battery: "90Wh",
          weight: "2.2kg",
          releaseYear: "2024",
          category: "LAPTOP",
          factory: "ASUS",
        },
        {
          name: "Lenovo ThinkPad X1 Carbon",
          originalPrice: 30000000,
          price: 28000000,
          coupon: 7,
          quantity: 10,
          warranty: "36 tháng",
          infor: "Siêu mỏng nhẹ, pin trâu, hiệu suất cao.",
          cpu: "Intel Core i7",
          ram: "16GB",
          storage: "1TB SSD",
          screen: "14 inch 2K IPS",
          graphicsCard: "Intel Iris Xe",
          battery: "57Wh",
          weight: "1.1kg",
          releaseYear: "2024",
          category: "LAPTOP",
          factory: "LENOVO",
        },
        {
          name: "MacBook Air M3 2024",
          originalPrice: 32000000,
          price: 30000000,
          coupon: 6,
          quantity: 12,
          warranty: "12 tháng",
          infor: "Chip M3 mới, pin cực trâu, macOS mượt mà.",
          cpu: "Apple M3",
          ram: "8GB",
          storage: "512GB SSD",
          screen: "13.6 inch Retina",
          graphicsCard: "Apple GPU",
          battery: "52.6Wh",
          weight: "1.24kg",
          releaseYear: "2024",
          category: "LAPTOP",
          factory: "MACBOOK",
        },
      ],
    });

    // ===== 5 Phone =====
    await prisma.product.createMany({
      data: [
        {
          name: "iPhone 15 Pro",
          originalPrice: 32000000,
          price: 29000000,
          coupon: 9,
          quantity: 20,
          warranty: "12 tháng",
          infor: "Siêu phẩm của Apple với chip A17 Pro.",
          cpu: "A17 Pro",
          ram: "8GB",
          storage: "256GB",
          screen: "6.1 inch OLED",
          graphicsCard: "Apple GPU",
          battery: "3300mAh",
          weight: "187g",
          releaseYear: "2024",
          category: "PHONE",
          factory: "IPHONE",
        },
        {
          name: "Samsung Galaxy S24 Ultra",
          originalPrice: 35000000,
          price: 32000000,
          coupon: 8,
          quantity: 15,
          warranty: "12 tháng",
          infor: "Camera 200MP, hiệu năng mạnh mẽ.",
          cpu: "Snapdragon 8 Gen 3",
          ram: "12GB",
          storage: "512GB",
          screen: "6.8 inch AMOLED",
          graphicsCard: "Adreno 750",
          battery: "5000mAh",
          weight: "233g",
          releaseYear: "2024",
          category: "PHONE",
          factory: "SAMSUNG",
        },
        {
          name: "Xiaomi 14 Pro",
          originalPrice: 25000000,
          price: 22000000,
          coupon: 10,
          quantity: 18,
          warranty: "12 tháng",
          infor: "Giá rẻ, hiệu năng cao, sạc siêu nhanh.",
          cpu: "Snapdragon 8 Gen 3",
          ram: "12GB",
          storage: "256GB",
          screen: "6.7 inch AMOLED",
          graphicsCard: "Adreno 740",
          battery: "4600mAh",
          weight: "200g",
          releaseYear: "2024",
          category: "PHONE",
          factory: "XIAOMI",
        },
        {
          name: "Oppo Find X7",
          originalPrice: 27000000,
          price: 25000000,
          coupon: 7,
          quantity: 20,
          warranty: "12 tháng",
          infor: "Camera đẹp, thiết kế sang trọng.",
          cpu: "Dimensity 9300",
          ram: "16GB",
          storage: "512GB",
          screen: "6.74 inch AMOLED",
          graphicsCard: "Immortalis-G720",
          battery: "4800mAh",
          weight: "210g",
          releaseYear: "2024",
          category: "PHONE",
          factory: "OPPO",
        },
        {
          name: "Samsung Galaxy Z Fold6",
          originalPrice: 35000000,
          price: 31500000,
          coupon: 10,
          quantity: 25,
          warranty: "12 tháng",
          infor: "Flagship killer cấu hình mạnh mẽ.",
          cpu: "Snapdragon 8 Gen 3",
          ram: "12GB",
          storage: "256GB",
          screen: "7.6 inch OLED",
          graphicsCard: "Adreno 750",
          battery: "5000mAh",
          weight: "205g",
          releaseYear: "2024",
          category: "PHONE",
          factory: "SAMSUNG",
        },
      ],
    });
  }

  const products = await prisma.product.findMany();

  // ========== PRODUCT FEATURES ==========
  const pfCount = await prisma.productFeature.count();
  if (pfCount === 0) {
    console.log("🔗 Gắn feature cho sản phẩm ...");

    const laptops = products.filter((p) => p.category === "LAPTOP");
    const phones = products.filter((p) => p.category === "PHONE");

    const [vanPhong, gaming, mongNhe, doHoa, camUng, laptopAI, dienThoai5G, dienThoaiAI, gamingPhone, phoThong4G, dienThoaiGap] = features;
    for (const laptop of laptops) {
      switch (laptop.name) {
        case "Dell Inspiron 15":
          await prisma.productFeature.create({ data: { productID: laptop.id, featureID: vanPhong.id } });
          break;

        case "HP Pavilion 14":
          await prisma.productFeature.createMany({
            data: [
              { productID: laptop.id, featureID: vanPhong.id },
              { productID: laptop.id, featureID: mongNhe.id },
            ],
          });
          break;

        case "ASUS TUF Gaming F15":
          await prisma.productFeature.createMany({
            data: [
              { productID: laptop.id, featureID: gaming.id },
              { productID: laptop.id, featureID: doHoa.id },
            ],
          });
          break;

        case "Lenovo ThinkPad X1 Carbon":
          await prisma.productFeature.createMany({
            data: [
              { productID: laptop.id, featureID: vanPhong.id },
              { productID: laptop.id, featureID: mongNhe.id },
            ],
          });
          break;

        case "MacBook Air M3 2024":
          await prisma.productFeature.createMany({
            data: [
              { productID: laptop.id, featureID: mongNhe.id },
              { productID: laptop.id, featureID: laptopAI.id },
            ],
          });
          break;
      }
    }

    for (const phone of phones) {
      switch (phone.name) {
        case "iPhone 15 Pro":
          await prisma.productFeature.create({ data: { productID: phone.id, featureID: dienThoai5G.id } });
          break;

        case "Samsung Galaxy S24 Ultra":
          await prisma.productFeature.createMany({
            data: [
              { productID: phone.id, featureID: dienThoai5G.id },
              { productID: phone.id, featureID: dienThoaiAI.id },
            ],
          });
          break;

        case "Xiaomi 14 Pro":
          await prisma.productFeature.createMany({
            data: [
              { productID: phone.id, featureID: gamingPhone.id },
              { productID: phone.id, featureID: phoThong4G.id },
            ],
          });
          break;

        case "Oppo Find X7":
          await prisma.productFeature.createMany({
            data: [
              { productID: phone.id, featureID: gamingPhone.id },
              { productID: phone.id, featureID: dienThoai5G.id },
            ],
          });
          break;

        case "Samsung Galaxy Z Fold6":
          await prisma.productFeature.createMany({
            data: [
              { productID: phone.id, featureID: dienThoai5G.id },
              { productID: phone.id, featureID: dienThoaiGap.id },
            ],
          });
          break;
      }
    }

  }

  // ========== ORDERS + REVIEWS ==========
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    console.log("🛒 Tạo đơn hàng và đánh giá...");

    for (const product of products) {
      const reviewers = [...users].sort(() => 0.5 - Math.random()).slice(0, 3);
      const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
      for (const user of reviewers) {
        await prisma.order.create({
          data: {
            userID: user.id,
            totalPrice: product.price || product.originalPrice,
            recipientName: user.name,
            address: "123 Đường ABC, TP.HCM",
            phone: "0901234567",
            status: "COMPLETED",
            orderDate: nowVN,
            trackingCode: `TRACK-${product.id}-${user.id}`,
            deliveryDate: nowVN,
            receivedDate: nowVN,
            orderItems: {
              create: [
                {
                  productID: product.id,
                  quantity: 1,
                  price: product.price || product.originalPrice,
                },
              ],
            },
            payment: {
              create: 
                {
                  amount: product.price || product.originalPrice,
                  method: "COD",
                  status: "PAIDED",
                },
            },
          },
        });

        await prisma.review.create({
          data: {
            userID: user.id,
            productID: product.id,
            rating: Math.floor(Math.random() * 5) + 1, 
            comment: `Sản phẩm ${product.name} rất tốt! Người dùng ${user.name} hài lòng.`,
          },
        });
      }

      // 🧮 Cập nhật số lượng bán ra = số người mua
      await prisma.product.update({
        where: { id: product.id },
        data: { sold: reviewers.length },
      });
    }
  }

  console.log("Seed hoàn tất!");
};

main()
  .catch((err) => {
    console.error("Lỗi seed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
