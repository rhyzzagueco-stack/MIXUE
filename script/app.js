let orderItems = [];
let currentProduct = null;
let currentPrice = null;
let selectedFlavor = null;

function loadSavedOrders() {
    const saved = localStorage.getItem('mixueOrders');
    if (saved) {
        orderItems = JSON.parse(saved);
        updateOrderListDisplay();
    }
}

function saveOrders() {
    localStorage.setItem('mixueOrders', JSON.stringify(orderItems));
}

function showToast(message, isError = false) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.style.background = isError ? 'linear-gradient(135deg, #ff4444, #cc0000)' : 'linear-gradient(135deg, #e60012, #cc0010)';
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

function showFlavorModal(productName, price, flavors) {
    currentProduct = productName;
    currentPrice = price;
    selectedFlavor = null;
    
    const modal = document.getElementById('flavorModal');
    const modalProductName = document.getElementById('modalProductName');
    const flavorOptions = document.getElementById('flavorOptions');
    const modalPrice = document.getElementById('modalPrice');
    
    modalProductName.textContent = productName;
    modalPrice.textContent = '₱' + price;
    
    flavorOptions.innerHTML = '';
    flavors.forEach(flavor => {
        const flavorDiv = document.createElement('div');
        flavorDiv.className = 'flavor-option';
        flavorDiv.textContent = flavor;
        flavorDiv.onclick = () => {
            document.querySelectorAll('.flavor-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            flavorDiv.classList.add('selected');
            selectedFlavor = flavor;
        };
        flavorOptions.appendChild(flavorDiv);
    });
    
    modal.style.display = 'block';
}

function closeFlavorModal() {
    const modal = document.getElementById('flavorModal');
    modal.style.display = 'none';
    selectedFlavor = null;
    currentProduct = null;
}

function addOrderWithFlavor() {
    if (!selectedFlavor) {
        showToast('Please select a flavor first!', true);
        return;
    }
    
    orderItems.push({
        name: currentProduct,
        flavor: selectedFlavor,
        price: currentPrice,
        timestamp: new Date().toLocaleTimeString()
    });
    
    saveOrders();
    updateOrderListDisplay();
    showToast(currentProduct + ' (' + selectedFlavor + ') added!');
    closeFlavorModal();
}

function removeOrder(index) {
    orderItems.splice(index, 1);
    saveOrders();
    updateOrderListDisplay();
    showToast('Item removed');
}

function clearAllOrders() {
    if (orderItems.length === 0) {
        showToast('No orders to clear');
        return;
    }
    
    if (confirm('Clear all orders?')) {
        orderItems = [];
        saveOrders();
        updateOrderListDisplay();
        showToast('All orders cleared');
    }
}

function updateOrderListDisplay() {
    const orderList = document.getElementById("orderList");
    if (!orderList) return;
    
    if (orderItems.length === 0) {
        orderList.innerHTML = '<li style="justify-content: center; color: #999;">No orders yet. Add some products!</li>';
        const existingDiv = orderList.parentElement.querySelector('.order-total');
        if (existingDiv) existingDiv.remove();
        return;
    }
    
    let total = 0;
    orderList.innerHTML = orderItems.map((item, index) => {
        total += parseInt(item.price) || 0;
        return `
            <li>
                <div style="flex:1">
                    <strong>${item.name}</strong>
                    <span style="display: block; font-size: 12px; color: #e60012;">Flavor: ${item.flavor}</span>
                </div>
                <div>
                    <span style="margin-right: 15px; font-weight: bold;">₱${item.price}</span>
                    <button class="remove-btn" onclick="removeOrder(${index})">✗</button>
                </div>
            </li>
        `;
    }).join('');
    
    const existingDiv = orderList.parentElement.querySelector('.order-total');
    if (!existingDiv) {
        const totalDiv = document.createElement('div');
        totalDiv.className = 'order-total';
        totalDiv.innerHTML = `
            <strong>Total: ₱${total}</strong>
            <span style="margin: 0 15px;">|</span>
            <strong>Items: ${orderItems.length}</strong>
            <button onclick="clearAllOrders()" class="btn clear-order" style="margin-left: 15px; padding: 6px 15px;">Clear All</button>
        `;
        orderList.parentElement.appendChild(totalDiv);
    } else {
        existingDiv.innerHTML = `
            <strong>Total: ₱${total}</strong>
            <span style="margin: 0 15px;">|</span>
            <strong>Items: ${orderItems.length}</strong>
            <button onclick="clearAllOrders()" class="btn clear-order" style="margin-left: 15px; padding: 6px 15px;">Clear All</button>
        `;
    }
}

function filterProducts() {
    const searchInput = document.getElementById("searchProduct");
    const filterSelect = document.getElementById("categoryFilter");
    
    if (!searchInput || !filterSelect) return;
    
    const searchValue = searchInput.value.toLowerCase();
    const category = filterSelect.value;
    
    const products = document.querySelectorAll(".product-card");
    let visibleCount = 0;
    
    products.forEach(product => {
        const name = product.querySelector("h3")?.innerText.toLowerCase() || "";
        const productCategory = product.dataset.category;
        
        let matchesSearch = name.includes(searchValue);
        let matchesCategory = category === "all" || category === productCategory;
        
        if (matchesSearch && matchesCategory) {
            product.style.display = "block";
            visibleCount++;
        } else {
            product.style.display = "none";
        }
    });
    
    const existingMsg = document.querySelector('.no-results');
    if (visibleCount === 0 && products.length > 0) {
        if (!existingMsg) {
            const msg = document.createElement('p');
            msg.className = 'no-results';
            msg.style.textAlign = 'center';
            msg.style.padding = '40px';
            msg.style.color = '#999';
            msg.innerHTML = 'No products found. Try another search!';
            products[0].parentElement?.appendChild(msg);
        }
    } else if (existingMsg) {
        existingMsg.remove();
    }
}

function setupAddOrderButtons() {
    const addButtons = document.querySelectorAll('.add-order-btn');
    
    addButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const productName = this.dataset.product;
            const price = this.dataset.price;
            let flavors = [];
            
            try {
                flavors = JSON.parse(this.dataset.flavors);
            } catch(e) {
                flavors = [];
            }
            
            if (flavors.length > 0) {
                showFlavorModal(productName, price, flavors);
            } else {
                showToast('No flavors available for this product', true);
            }
        });
    });
}

function setupReservationForm() {
    const form = document.getElementById("reservationForm");
    if (!form) return;
    
    const productSelect = document.getElementById("product");
    const flavorGroup = document.getElementById("flavorGroup");
    const flavorButtonsDiv = document.getElementById("flavorButtons");
    const selectedFlavorInput = document.getElementById("selectedFlavor");
    const quantityInput = document.getElementById("quantity");
    const serviceTypeSelect = document.getElementById("serviceType");
    const priceSummary = document.getElementById("priceSummary");
    const subtotalSpan = document.getElementById("subtotal");
    const totalAmountSpan = document.getElementById("totalAmount");
    const deliveryFeeRow = document.getElementById("deliveryFeeRow");
    
    let currentProductPrice = 0;
    let currentFlavors = [];
    
    const productPrices = {
        "Ice Cream Cone": 39,
        "Soft Serve Twist": 49,
        "Chocolate Sundae": 59,
        "Fresh Lemonade": 49,
        "Fruit Tea": 55,
        "Milk Tea Series": 59,
        "Cheese Tea": 69,
        "Snow Ice": 79
    };
    
    if (productSelect) {
        productSelect.addEventListener("change", function() {
            const selectedOption = this.options[this.selectedIndex];
            const productName = this.value;
            const flavorsData = selectedOption.getAttribute("data-flavors");
            
            currentProductPrice = productPrices[productName] || 0;
            
            if (flavorsData && productName !== "") {
                try {
                    currentFlavors = JSON.parse(flavorsData);
                    displayFlavorButtons(currentFlavors);
                    flavorGroup.style.display = "block";
                } catch(e) {
                    console.error("Error parsing flavors:", e);
                    flavorGroup.style.display = "none";
                }
            } else {
                flavorGroup.style.display = "none";
                currentFlavors = [];
            }
            
            if (selectedFlavorInput) selectedFlavorInput.value = "";
            
            updatePrice();
        });
    }
    
    function displayFlavorButtons(flavors) {
        if (!flavorButtonsDiv) return;
        
        flavorButtonsDiv.innerHTML = "";
        
        flavors.forEach(flavor => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "flavor-btn";
            btn.textContent = flavor;
            
            btn.addEventListener("click", function() {
                document.querySelectorAll(".flavor-btn").forEach(btn => {
                    btn.classList.remove("selected");
                });
                
                this.classList.add("selected");
                
                if (selectedFlavorInput) {
                    selectedFlavorInput.value = flavor;
                }
                
                showToast(flavor + ' flavor selected');
            });
            
            flavorButtonsDiv.appendChild(btn);
        });
    }
    
    function updatePrice() {
        if (!quantityInput || !subtotalSpan || !totalAmountSpan) return;
        
        const quantity = parseInt(quantityInput.value) || 1;
        const subtotal = currentProductPrice * quantity;
        const serviceType = serviceTypeSelect ? serviceTypeSelect.value : "Dine In";
        const deliveryFee = (serviceType === "Delivery") ? 30 : 0;
        const total = subtotal + deliveryFee;
        
        subtotalSpan.textContent = subtotal;
        totalAmountSpan.textContent = total;
        
        if (priceSummary && currentProductPrice > 0) {
            priceSummary.style.display = "block";
        }
        
        if (deliveryFeeRow) {
            deliveryFeeRow.style.display = serviceType === "Delivery" ? "block" : "none";
        }
    }
    
    if (quantityInput) {
        quantityInput.addEventListener("change", updatePrice);
        quantityInput.addEventListener("input", updatePrice);
    }
    
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener("change", updatePrice);
    }
    
    const dateInput = document.getElementById("date");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const name = document.getElementById("name")?.value || "";
        const email = document.getElementById("email")?.value || "";
        const phone = document.getElementById("phone")?.value || "";
        const product = document.getElementById("product")?.value || "";
        const selectedFlavor = document.getElementById("selectedFlavor")?.value || "";
        const quantity = document.getElementById("quantity")?.value || "1";
        const date = document.getElementById("date")?.value || "";
        const time = document.getElementById("time")?.value || "";
        const serviceType = document.getElementById("serviceType")?.value || "";
        const message = document.getElementById("message")?.value || "";
        
        if (!name) { showToast("Please enter your name!", true); return; }
        if (!email) { showToast("Please enter your email!", true); return; }
        if (!phone) { showToast("Please enter your contact number!", true); return; }
        if (!product) { showToast("Please select a product!", true); return; }
        if (!date) { showToast("Please select a reservation date!", true); return; }
        if (!time) { showToast("Please select a reservation time!", true); return; }
        
        if (!email.includes('@')) {
            showToast("Please enter a valid email address!", true);
            return;
        }
        
        if (currentFlavors.length > 0 && !selectedFlavor) {
            showToast("Please select a flavor for your product!", true);
            return;
        }
        
        const subtotal = currentProductPrice * parseInt(quantity);
        const deliveryFee = (serviceType === "Delivery") ? 30 : 0;
        const total = subtotal + deliveryFee;
        
        const reference = "MIX-" + Math.floor(Math.random() * 10000) + "-" + Math.floor(Math.random() * 1000);
        
        const confirmationDiv = document.getElementById("confirmation");
        if (confirmationDiv) {
            confirmationDiv.innerHTML = `
                <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 25px; border-radius: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 50px;">✅</div>
                        <h3 style="color: #e60012; margin: 10px 0;">Reservation Confirmed!</h3>
                        <p style="font-size: 14px; color: #666;">Reference #: ${reference}</p>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 15px;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Contact:</strong> ${phone}</p>
                        <hr style="margin: 10px 0;">
                        <p><strong>Product:</strong> ${product}</p>
                        ${selectedFlavor ? `<p><strong>Flavor:</strong> ${selectedFlavor}</p>` : ''}
                        <p><strong>Quantity:</strong> ${quantity}</p>
                        <p><strong>Subtotal:</strong> ₱${subtotal}</p>
                        ${serviceType === "Delivery" ? `<p><strong>Delivery Fee:</strong> ₱30</p>` : ''}
                        <p><strong>Total:</strong> ₱${total}</p>
                        <hr style="margin: 10px 0;">
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Time:</strong> ${time}</p>
                        <p><strong>Service:</strong> ${serviceType}</p>
                        ${message ? `<p><strong>Notes:</strong> ${message}</p>` : ''}
                    </div>
                    
                    <div style="margin-top: 15px; text-align: center;">
                        <p style="color: #e60012; font-weight: bold;">Thank you for choosing Mixue!</p>
                        <p style="font-size: 12px; color: #888;">We will send a confirmation to your email.</p>
                    </div>
                </div>
            `;
            confirmationDiv.classList.add('show');
            confirmationDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        showToast('Reservation confirmed for ' + name + '! Total: ₱' + total);
        
        const reservation = {
            reference,
            name,
            email,
            phone,
            product,
            flavor: selectedFlavor,
            quantity,
            subtotal,
            deliveryFee,
            total,
            date,
            time,
            serviceType,
            message,
            timestamp: new Date().toISOString()
        };
        
        let reservations = JSON.parse(localStorage.getItem('mixueReservations') || '[]');
        reservations.push(reservation);
        localStorage.setItem('mixueReservations', JSON.stringify(reservations));
        
        form.reset();
        
        if (flavorGroup) flavorGroup.style.display = "none";
        if (flavorButtonsDiv) flavorButtonsDiv.innerHTML = "";
        if (selectedFlavorInput) selectedFlavorInput.value = "";
        if (priceSummary) priceSummary.style.display = "none";
        currentProductPrice = 0;
        
        if (productSelect) productSelect.value = "";
        
        setTimeout(() => {
            if (confirmationDiv) {
                confirmationDiv.classList.remove('show');
            }
        }, 10000);
    });
}

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("Mixue System Ready");
    
    loadSavedOrders();
    setupReservationForm();
    setActiveNav();
    setupAddOrderButtons();
    
    const modal = document.getElementById('flavorModal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancelFlavorBtn');
    const confirmBtn = document.getElementById('confirmFlavorBtn');
    
    if (closeBtn) {
        closeBtn.onclick = closeFlavorModal;
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = closeFlavorModal;
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = addOrderWithFlavor;
    }
    
    window.onclick = function(event) {
        if (event.target === modal) {
            closeFlavorModal();
        }
    }
    
    const searchInput = document.getElementById("searchProduct");
    const filterSelect = document.getElementById("categoryFilter");
    
    if (searchInput) searchInput.addEventListener("keyup", filterProducts);
    if (filterSelect) filterSelect.addEventListener("change", filterProducts);
});
