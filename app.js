// VÉLOURS Luxury E-Commerce Engine

// Product Database
const products = [
    {
        id: 'p1',
        name: "L'Élixir Couture Gown",
        category: 'Haute Couture',
        price: 4200,
        image: 'assets/category_couture.jpg',
        badge: 'Bespoke',
        description: 'A handcrafted masterpiece made from fine French silk and embellished with gold metallic embroidery. Featuring a tailored silhouette, a plunging neckline, and a sweeping train, this gown is custom-made to measure by our Parisian artisans.',
        variants: ['XS', 'S', 'M', 'L']
    },
    {
        id: 'p2',
        name: 'Classic Noir Leather Bag',
        category: 'Leather Bags',
        price: 2800,
        image: 'assets/category_bags.jpg',
        badge: 'Signature',
        description: 'Our signature quilted black designer leather handbag with a gold-tone chain strap. Masterfully constructed in Florence from premium full-grain Italian calfskin, featuring a luxuriously soft suede-lined interior and gold-plated hardware.',
        variants: ['Default']
    },
    {
        id: 'p3',
        name: 'Aurelia Gold Necklace',
        category: 'Fine Jewelry',
        price: 5400,
        image: 'assets/category_jewelry.jpg',
        badge: 'Limited',
        description: '18k warm yellow gold pendant featuring a hand-selected, brilliant-cut conflict-free diamond. Suspended on a delicate 16-inch faceted gold chain, this piece is designed to catch the light at every angle and become a lifetime keepsake.',
        variants: ['Yellow Gold', 'Rose Gold', 'White Gold']
    },
    {
        id: 'p4',
        name: 'Vélours Signature Fragrance',
        category: 'Fragrances',
        price: 320,
        image: 'assets/category_fragrance.jpg',
        badge: 'Exclusive',
        description: 'An opulent, oriental-woody scent defined by deep base notes of black amber, velvet patchouli, and warm Madagascar vanilla, balanced by top notes of rare saffron and absolute rose. Housed in a custom black glass bottle with a heavy metallic cap.',
        variants: ['50ml', '100ml']
    }
];

// App States
let cart = JSON.parse(localStorage.getItem('velours_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('velours_wishlist')) || [];
let selectedProduct = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    initNavigation();
    initFeaturedProducts();
    initCartDrawer();
    initQuickViewModal();
    initSearchOverlay();
    initWishlist();
    initCountdownTimer();
    initTestimonials();
    initForms();
    updateCartUI();
    updateWishlistUI();
});

// ==================== 1. Navigation Effects ====================
function initNavigation() {
    const header = document.querySelector('header');
    
    // Scrolled header background transition
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile nav toggling
    const menuToggleBtn = document.querySelector('.menu-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavClose = document.querySelector('.mobile-nav-close');

    if (menuToggleBtn && mobileNav) {
        menuToggleBtn.addEventListener('click', () => {
            mobileNav.classList.add('open');
        });
    }

    if (mobileNavClose && mobileNav) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('open');
        });
    }

    // Close mobile nav when clicking on a link
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
        });
    });
}

// ==================== 2. Render Products ====================
function initFeaturedProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    products.forEach(product => {
        const isWishlisted = wishlist.includes(product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);

        card.innerHTML = `
            <div class="product-image-container">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <button class="product-wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlistItem('${product.id}')" aria-label="Add to Wishlist">
                    <i data-lucide="${isWishlisted ? 'heart-handshake' : 'heart'}"></i>
                </button>
                <img class="product-image" src="${product.image}" alt="${product.name}">
                <div class="product-actions-overlay">
                    <button class="product-action-btn quick-view-trigger" onclick="openQuickView('${product.id}')">Quick View</button>
                    <button class="product-action-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">$${product.price.toLocaleString()}</div>
            </div>
        `;

        productsGrid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') {
        lucide.createIcons({
            attrs: {
                class: 'lucide-icon'
            },
            nameAttr: 'data-lucide'
        });
    }
}

// ==================== 3. Cart Mechanics ====================
function initCartDrawer() {
    const cartIcon = document.querySelector('.cart-icon-btn');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartCloseBtn = document.querySelector('.cart-close-btn');

    if (cartIcon && cartOverlay) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartOverlay.classList.add('open');
        });
    }

    if (cartCloseBtn && cartOverlay) {
        cartCloseBtn.addEventListener('click', () => {
            cartOverlay.classList.remove('open');
        });
    }

    // Close on overlay click
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                cartOverlay.classList.remove('open');
            }
        });
    }
}

function addToCart(productId, quantity = 1, variant = null) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const selectedVariant = variant || product.variants[0];
    const existingIndex = cart.findIndex(item => item.id === productId && item.variant === selectedVariant);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            variant: selectedVariant,
            quantity: quantity
        });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${quantity}x ${product.name} (${selectedVariant}) to cart.`);

    // Open Cart Drawer
    document.querySelector('.cart-overlay').classList.add('open');
}

function changeQty(productId, variant, delta) {
    const index = cart.findIndex(item => item.id === productId && item.variant === variant);
    if (index === -1) return;

    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCartUI();
}

function removeFromCart(productId, variant) {
    cart = cart.filter(item => !(item.id === productId && item.variant === variant));
    saveCart();
    updateCartUI();
    showToast('Item removed from cart.');
}

function saveCart() {
    localStorage.setItem('velours_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const container = document.querySelector('.cart-items-container');
    const badgeCounters = document.querySelectorAll('.cart-badge');
    const totalDisplay = document.querySelector('.cart-total-price');

    if (!container) return;

    let totalItems = 0;
    let totalPrice = 0;

    if (cart.length === 0) {
        container.innerHTML = '<div class="cart-empty-message">Your shopping bag is empty.</div>';
    } else {
        container.innerHTML = '';
        cart.forEach(item => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img class="cart-item-img" src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-category">${item.category} ${item.variant !== 'Default' ? `| ${item.variant}` : ''}</span>
                    <span class="cart-item-price">$${(item.price * item.quantity).toLocaleString()}</span>
                    <div class="cart-item-quantity-controls">
                        <button class="cart-qty-btn" onclick="changeQty('${item.id}', '${item.variant}', -1)">-</button>
                        <span class="cart-qty-num">${item.quantity}</span>
                        <button class="cart-qty-btn" onclick="changeQty('${item.id}', '${item.variant}', 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove-btn" onclick="removeFromCart('${item.id}', '${item.variant}')">
                    <i data-lucide="trash-2"></i>
                </button>
            `;
            container.appendChild(div);
        });
    }

    // Refresh icons inside cart
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    badgeCounters.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    });

    if (totalDisplay) {
        totalDisplay.textContent = `$${totalPrice.toLocaleString()}`;
    }
}

// ==================== 4. Wishlist Mechanics ====================
function initWishlist() {
    const wishlistIcons = document.querySelectorAll('.wishlist-icon-btn');
    wishlistIcons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // In a full implementation, you could open a Wishlist panel. 
            // For now, it will show a toast notification showing wishlist status.
            if (wishlist.length === 0) {
                showToast('Your wishlist is empty.');
            } else {
                const wishlistNames = wishlist.map(id => products.find(p => p.id === id)?.name).join(', ');
                showToast(`Wishlisted items: ${wishlistNames}`);
            }
        });
    });
}

function toggleWishlistItem(productId) {
    const index = wishlist.indexOf(productId);
    const product = products.find(p => p.id === productId);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`Removed ${product?.name || 'item'} from wishlist.`);
    } else {
        wishlist.push(productId);
        showToast(`Added ${product?.name || 'item'} to wishlist.`);
    }

    localStorage.setItem('velours_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    initFeaturedProducts(); // Refresh buttons in grids
}

function updateWishlistUI() {
    const badgeCounters = document.querySelectorAll('.wishlist-badge');
    badgeCounters.forEach(badge => {
        badge.textContent = wishlist.length;
        badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });
}

// ==================== 5. Quick View Lightbox Modal ====================
function initQuickViewModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalCloseBtn = document.querySelector('.modal-close-btn');

    if (modalCloseBtn && modalOverlay) {
        modalCloseBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('open');
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('open');
            }
        });
    }
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    selectedProduct = product;

    const modalOverlay = document.querySelector('.modal-overlay');
    const modalImg = document.querySelector('.modal-gallery img');
    const modalCategory = document.querySelector('.modal-category');
    const modalTitle = document.querySelector('.modal-title');
    const modalPrice = document.querySelector('.modal-price');
    const modalDesc = document.querySelector('.modal-description');
    const variantContainer = document.querySelector('.variant-options');
    const qtyNum = document.querySelector('.modal-qty-num');

    // Reset qty
    qtyNum.textContent = '1';

    modalImg.src = product.image;
    modalImg.alt = product.name;
    modalCategory.textContent = product.category;
    modalTitle.textContent = product.name;
    modalPrice.textContent = `$${product.price.toLocaleString()}`;
    modalDesc.textContent = product.description;

    // Render variants
    variantContainer.innerHTML = '';
    product.variants.forEach((v, index) => {
        const btn = document.createElement('button');
        btn.className = `variant-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = v;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
        variantContainer.appendChild(btn);
    });

    // Quantity buttons inside Modal
    const minusBtn = document.querySelector('.modal-qty-btn.minus');
    const plusBtn = document.querySelector('.modal-qty-btn.plus');
    
    // Remove previous event listeners by cloning
    const newMinusBtn = minusBtn.cloneNode(true);
    const newPlusBtn = plusBtn.cloneNode(true);
    minusBtn.parentNode.replaceChild(newMinusBtn, minusBtn);
    plusBtn.parentNode.replaceChild(newPlusBtn, plusBtn);

    newMinusBtn.addEventListener('click', () => {
        let currentVal = parseInt(qtyNum.textContent);
        if (currentVal > 1) {
            qtyNum.textContent = currentVal - 1;
        }
    });

    newPlusBtn.addEventListener('click', () => {
        let currentVal = parseInt(qtyNum.textContent);
        qtyNum.textContent = currentVal + 1;
    });

    // Add to Cart from Modal
    const addToCartModalBtn = document.querySelector('.modal-add-btn');
    const newAddToCartModalBtn = addToCartModalBtn.cloneNode(true);
    addToCartModalBtn.parentNode.replaceChild(newAddToCartModalBtn, addToCartModalBtn);

    newAddToCartModalBtn.addEventListener('click', () => {
        const activeVariant = document.querySelector('.variant-btn.active')?.textContent || 'Default';
        const qty = parseInt(qtyNum.textContent);
        addToCart(product.id, qty, activeVariant);
        modalOverlay.classList.remove('open');
    });

    modalOverlay.classList.add('open');
}

// ==================== 6. Search Overlay ====================
function initSearchOverlay() {
    const searchIcon = document.querySelector('.search-icon-btn');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close-btn');
    const searchInput = document.querySelector('.search-input');

    if (searchIcon && searchOverlay) {
        searchIcon.addEventListener('click', (e) => {
            e.preventDefault();
            searchOverlay.classList.add('open');
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        });
    }

    if (searchClose && searchOverlay) {
        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('open');
        });
    }

    // Handle dummy search submission
    const form = document.querySelector('.search-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = searchInput.value.trim();
            if (val) {
                showToast(`Searching for "${val}" in Boutique Database...`);
                searchOverlay.classList.remove('open');
                searchInput.value = '';
            }
        });
    }
}

// ==================== 7. Countdown Timer ====================
function initCountdownTimer() {
    // Set special offer end date: 7 days from now
    const offerEndDate = new Date();
    offerEndDate.setDate(offerEndDate.getDate() + 7);

    const daysVal = document.getElementById('days');
    const hoursVal = document.getElementById('hours');
    const minutesVal = document.getElementById('minutes');
    const secondsVal = document.getElementById('seconds');

    if (!daysVal) return;

    function updateTimer() {
        const now = new Date().getTime();
        const difference = offerEndDate.getTime() - now;

        if (difference <= 0) {
            clearInterval(timerInterval);
            document.querySelector('.countdown-container').innerHTML = '<div style="font-size: 1.2rem; color: var(--accent);">Exclusive Event Concluded</div>';
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysVal.textContent = days.toString().padStart(2, '0');
        hoursVal.textContent = hours.toString().padStart(2, '0');
        minutesVal.textContent = minutes.toString().padStart(2, '0');
        secondsVal.textContent = seconds.toString().padStart(2, '0');
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

// ==================== 8. Testimonials Slider ====================
function initTestimonials() {
    const track = document.querySelector('.testimonial-track');
    const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
    const prevBtn = document.querySelector('.testimonial-arrow.prev');
    const nextBtn = document.querySelector('.testimonial-arrow.next');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;

    function moveToSlide(index) {
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            moveToSlide(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            moveToSlide(currentIndex + 1);
        });
    }

    // Auto-swipe testimonial slider every 10 seconds
    setInterval(() => {
        moveToSlide(currentIndex + 1);
    }, 10000);
}

// ==================== 9. Form Submissions ====================
function initForms() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('.newsletter-input');
            const email = emailInput.value.trim();
            if (email) {
                showToast('Welcome to the Maison. Your VIP invitation has been sent.');
                emailInput.value = '';
            }
        });
    }
}

// ==================== 10. Toast Notification Engine ====================
function showToast(message) {
    const container = document.querySelector('.toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="toast-icon" data-lucide="info"></i>
        <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);
    
    // Initialize icon inside toast
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Animation trigger
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Fade out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 4000);
}
