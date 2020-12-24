**Tạo ra modal kho**

-   id kho
-   tên kho
-   mã sp
-   số lượng

[HttpPost]

### Lúc tạo hóa đơn theo luồng ( người mua hàng ):

try
{

-   Check từng sản phẩm trong giỏ hàng so với kho trong kho
-   đủ thì tạo không đủ thì thông báo lỗi
-   sau đó là update số lượng trong kho
    }
    catch
    {
    trả về lỗi
    }

### hóa đơn

-   chi tiết hóa đơn[ {
    mã sp
    so luong
    }
    ]
-   id hoa don
-   ma nv
-   mã KH
-   ngày lập
