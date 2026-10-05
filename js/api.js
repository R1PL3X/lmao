/* =========================================================
   UONG BI GO - API CLIENT
   File: js/api.js
   ========================================================= */

const SITE_ROOT = new URL("../", document.currentScript.src).href;


/* =========================================================
   AUTH
   ========================================================= */

const Auth = {
    TOKEN_KEY: "ubg_token",
    USER_KEY: "ubg_user",

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY) || "";
    },

    setToken(token) {
        if (token) {
            localStorage.setItem(this.TOKEN_KEY, token);
        } else {
            localStorage.removeItem(this.TOKEN_KEY);
        }
    },

    getUser() {
        try {
            const raw = localStorage.getItem(this.USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error("Không đọc được thông tin người dùng:", error);
            return null;
        }
    },

    setUser(user) {
        if (user) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.USER_KEY);
        }
    },

    login(data) {
        if (!data) return;

        if (data.accessToken) {
            this.setToken(data.accessToken);
        }

        if (data.nguoiDung) {
            this.setUser(data.nguoiDung);
        }
    },

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);

        window.location.href = "index.html";
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    hasRole(role) {
        const user = this.getUser();
        return !!user && user.vaiTro === role;
    },

    redirectByRole() {
        const user = this.getUser();

        if (!user) {
            window.location.href = "index.html";
            return;
        }

        switch (user.vaiTro) {
            case "ROLE_BUYER":
                window.location.href = "menu.html";
                break;

            case "ROLE_STAFF":
                window.location.href = "kds.html";
                break;

            case "ROLE_ADMIN":
                window.location.href = "admin/dashboard.html";
                break;

            default:
                window.location.href = "index.html";
        }
    }
};


/* =========================================================
   API FETCH
   ========================================================= */

async function apiFetch(path, options = {}) {

    /*
     * Ví dụ:
     *
     * apiFetch("/kds/orders")
     *
     * sẽ gọi:
     *
     * /api/kds/orders
     */

    const [rawPath, queryStr] = String(path || "").split("?");

    /*
     * Loại bỏ "/" ở đầu để tránh ghép URL sai.
     */
    const apiPath = rawPath.replace(/^\/+/, "");

    /*
     * URL API:
     * /api/...
     */
    const apiUrl = new URL(
        `api/${apiPath}${queryStr ? `?${queryStr}` : ""}`,
        SITE_ROOT
    );


    /* -----------------------------------------------------
       HEADERS
       ----------------------------------------------------- */

    const headers = {
        "Content-Type": "application/json"
    };

    /*
     * Lấy token đăng nhập.
     */
    const token = Auth.getToken();

    /*
     * Backend đang đọc:
     * req.headers["x-ubg-token"]
     *
     * HTTP header không phân biệt hoa thường nên:
     * X-UBG-Token
     * x-ubg-token
     *
     * là tương đương.
     */
    if (token) {
        headers["X-UBG-Token"] = token;
    }


    /* -----------------------------------------------------
       REQUEST BODY
       ----------------------------------------------------- */

    let requestBody = undefined;

    if (options.body !== undefined && options.body !== null) {

        if (typeof options.body === "string") {
            requestBody = options.body;
        } else {
            requestBody = JSON.stringify(options.body);
        }
    }


    /* -----------------------------------------------------
       SEND REQUEST
       ----------------------------------------------------- */

    let response;

    try {

        response = await fetch(apiUrl.href, {
            method: (options.method || "GET").toUpperCase(),

            headers,

            credentials: "same-origin",

            body: requestBody
        });

    } catch (error) {

        console.error("API FETCH ERROR:", error);

        throw {
            status: 0,

            message:
                "Không kết nối được máy chủ. " +
                "Vui lòng kiểm tra mạng hoặc cấu hình Vercel."
        };
    }


    /* -----------------------------------------------------
       READ RESPONSE
       ----------------------------------------------------- */

    let data = {};

    const contentType =
        response.headers.get("content-type") || "";

    try {

        /*
         * Nếu API trả JSON
         */
        if (contentType.includes("application/json")) {

            data = await response.json();

        } else {

            /*
             * Nếu API không trả JSON thì đọc text
             */
            const text = await response.text();

            if (text) {
                data = {
                    message: text
                };
            }
        }

    } catch (error) {

        console.error(
            "Không đọc được response từ API:",
            error
        );

        data = {};
    }


    /* -----------------------------------------------------
       HANDLE HTTP ERROR
       ----------------------------------------------------- */

    if (!response.ok) {

        console.error("API ERROR:", {
            url: apiUrl.href,
            status: response.status,
            statusText: response.statusText,
            data: data
        });


        /*
         * Ưu tiên lấy message thật từ backend.
         *
         * Backend của bạn dùng:
         *
         * {
         *   message: "..."
         * }
         *
         * nên phải đọc data.message.
         */
        const errorMessage =
            data.message ||
            data.error ||
            data.details ||
            `API lỗi ${response.status}: ${response.statusText}`;


        throw {
            status: response.status,

            message: errorMessage,

            data: data
        };
    }


    /* -----------------------------------------------------
       QR PAYMENT SUPPORT
       ----------------------------------------------------- */

    /*
     * Một số API thanh toán có:
     *
     * maQr
     *
     * nhưng không có:
     *
     * qrImageBase64
     *
     * thì tạo QR giả ở frontend nếu function tồn tại.
     */

    if (
        rawPath.startsWith("/thanhtoan/") &&
        data &&
        !data.qrImageBase64 &&
        data.maQr &&
        typeof makeFakeQrDataUri === "function"
    ) {

        data.qrImageBase64 =
            makeFakeQrDataUri(data.maQr);
    }


    /* -----------------------------------------------------
       RETURN DATA
       ----------------------------------------------------- */

    return data;
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login(email, matKhau) {

    const data = await apiFetch("/auth/login", {

        method: "POST",

        body: {
            email: email,
            matKhau: matKhau
        }

    });

    /*
     * Lưu token + user.
     */
    Auth.login(data);

    return data;
}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {
    Auth.logout();
}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

async function getCurrentUser() {

    return await apiFetch("/auth/me");

}


/* =========================================================
   MENU
   ========================================================= */

async function getMenu() {

    return await apiFetch("/menu");

}


/* =========================================================
   ORDERS
   ========================================================= */

async function getOrders() {

    return await apiFetch("/orders");

}


async function getOrder(id) {

    return await apiFetch(`/orders/${id}`);

}


async function createOrder(orderData) {

    return await apiFetch("/orders", {

        method: "POST",

        body: orderData

    });

}


/* =========================================================
   KDS - KITCHEN DISPLAY SYSTEM
   ========================================================= */

/*
 * Lấy danh sách đơn hàng cho bếp.
 *
 * Endpoint backend:
 *
 * GET /api/kds/orders
 */

async function getKdsOrders() {

    return await apiFetch("/kds/orders");

}


/*
 * Cập nhật trạng thái đơn hàng.
 *
 * Endpoint:
 *
 * PATCH /api/kds/orders/{id}/status
 */

async function updateKdsOrderStatus(id, trangThaiMoi) {

    return await apiFetch(
        `/kds/orders/${id}/status`,
        {
            method: "PATCH",

            body: {
                trangThaiMoi: trangThaiMoi
            }
        }
    );

}


/*
 * Bật / tắt món trong KDS.
 *
 * Endpoint:
 *
 * PATCH /api/kds/mon/{id}/toggle
 */

async function toggleKdsMenu(id) {

    return await apiFetch(
        `/kds/mon/${id}/toggle`,
        {
            method: "PATCH"
        }
    );

}


/* =========================================================
   ADMIN
   ========================================================= */

async function getAdminOrders() {

    return await apiFetch("/admin/orders");

}


async function getAdminMenu() {

    return await apiFetch("/admin/menu");

}


async function createMenuItem(menuData) {

    return await apiFetch("/admin/menu", {

        method: "POST",

        body: menuData

    });

}


async function updateMenuItem(id, menuData) {

    return await apiFetch(
        `/admin/menu/${id}`,
        {
            method: "PUT",

            body: menuData
        }
    );

}


async function deleteMenuItem(id) {

    return await apiFetch(
        `/admin/menu/${id}`,
        {
            method: "DELETE"
        }
    );

}


/* =========================================================
   PAYMENT
   ========================================================= */

async function createPayment(orderId, paymentData) {

    return await apiFetch(
        `/thanhtoan/${orderId}`,
        {
            method: "POST",

            body: paymentData
        }
    );

}


/* =========================================================
   HEALTH CHECK
   ========================================================= */

async function checkApiHealth() {

    return await apiFetch("/health");

}


async function checkDatabaseHealth() {

    return await apiFetch("/db-health");

}


/* =========================================================
   DEBUG HELPER
   ========================================================= */

/*
 * Dùng trong Console trình duyệt:
 *
 * debugApi()
 *
 * để kiểm tra:
 * - URL website
 * - API URL
 * - token
 * - user
 */

function debugApi() {

    const token = Auth.getToken();

    const user = Auth.getUser();

    const apiHealthUrl =
        new URL(
            "api/health",
            SITE_ROOT
        ).href;

    const dbHealthUrl =
        new URL(
            "api/db-health",
            SITE_ROOT
        ).href;

    console.group("===== UONG BI GO API DEBUG =====");

    console.log(
        "SITE_ROOT:",
        SITE_ROOT
    );

    console.log(
        "API Health:",
        apiHealthUrl
    );

    console.log(
        "DB Health:",
        dbHealthUrl
    );

    console.log(
        "Token:",
        token
            ? "ĐÃ CÓ TOKEN"
            : "CHƯA CÓ TOKEN"
    );

    console.log(
        "User:",
        user
    );

    console.log(
        "Role:",
        user?.vaiTro || "Không có"
    );

    console.groupEnd();

}


/* =========================================================
   EXPORT GLOBAL FUNCTIONS
   ========================================================= */

window.Auth = Auth;

window.apiFetch = apiFetch;

window.login = login;

window.logout = logout;

window.getCurrentUser = getCurrentUser;

window.getMenu = getMenu;

window.getOrders = getOrders;

window.getOrder = getOrder;

window.createOrder = createOrder;

window.getKdsOrders = getKdsOrders;

window.updateKdsOrderStatus = updateKdsOrderStatus;

window.toggleKdsMenu = toggleKdsMenu;

window.getAdminOrders = getAdminOrders;

window.getAdminMenu = getAdminMenu;

window.createMenuItem = createMenuItem;

window.updateMenuItem = updateMenuItem;

window.deleteMenuItem = deleteMenuItem;

window.createPayment = createPayment;

window.checkApiHealth = checkApiHealth;

window.checkDatabaseHealth = checkDatabaseHealth;

window.debugApi = debugApi;
