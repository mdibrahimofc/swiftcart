let allProducts = []
const products = document.getElementById("products")
console.log(products);
const fetchAllProducts = async () => {
    try{
        const res = await fetch("https://fakestoreapi.com/products")
        allProducts = await res.json()
        displayProducst(allProducts)

    } catch(error){
        console.log(error);
    }
}
// const product = {category: 
// "men's clothing"
// description
// : 
// "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday"
// id
// : 
// 1
// image
// : 
// "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png"
// price
// : 
// 109.95
// rating
// : 
// count
// : 
// 120
// rate
// : 
// 3.9
// Object
// title
// : 
// "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops"}

const displayProducst = (allProducts)=> {
    const top3 = allProducts.sort((a, b)=> b?.rating?.rate - a?.rating?.rate).slice(0,3)
    products.innerHTML = top3.map(p=>`<div
              class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div class="bg-gray-100 p-6">
                <img
                  src=${p?.image}
                  alt="Product"
                  class="w-full h-56 object-contain"
                />
              </div>

              <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600"
                  >
                    ${p?.category}
                  </span>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <span class="inline-flex items-center gap-1">
                      <i class="fa-solid fa-star text-amber-400"></i>
                      <span class="font-medium text-gray-700">${p?.rating?.rate}</span>
                    </span>
                    <span>(${p?.rating?.count})</span>
                  </div>
                </div>

                <h3
                  class="text-base font-semibold text-gray-900 leading-snug mb-2"
                >
                  ${p?.title}
                </h3>

                <div class="text-lg font-bold text-gray-900 mb-5">$${p?.price}</div>

                <div class="flex items-center gap-3">
                  <button
                    class="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    <i class="fa-regular fa-eye"></i>
                    Details
                  </button>
                  <button
                    class="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                  >
                    <i class="fa-solid fa-cart-shopping"></i>
                    Add
                  </button>
                </div>
              </div>
            </div>`).join("")
}


fetchAllProducts()