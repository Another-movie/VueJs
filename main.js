Vue.config.devtools = true
var eventBus = new Vue()

Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true
    }
  },
  template: `
  <div class="product">
      <div class="product-image">
          <img :src="image">
      </div>
      <div class="product-info">
          <h1 v-if="onSale">{{ title }}</h1>
          <p v-if="inStock">In Stock</p>
          <p v-else :class="{ 'text-asd': !inStock}">Out of stock</p>

          <info-tabs :shipping="shipping" :details='details'></info-tabs>

          <div v-for="(v, index) in variants"
              :key="v.id"
              class="color-box"
              :style="{ background: v.color}"
              @mouseover="updateProduct(index)">
              
          </div>
          
          <button @click="addCart" 
                  :disabled="!inStock"
                  :class="{ disabledButton: !inStock}">Add to Cart</button>

          <button @click="removeFromCart" :disabled="!inStock" :class="{ disabledButton: !inStock}">
            Remove from cart
          </button>
      </div>

      <product-tabs :reviews="reviews"></product-tabs>

      
    </div> 
  `,
  data(){ return{
    onSale: true,
    brand: "Vue Mastery",
    product: "Socks",
    details: ["80% cotton", "70% hlopok", "Natural-Green"],    
    selectedVariant: 0,
    reviews: [],
    variants: [
      {
        id: 2234,
        color: "green",
        image: './img/greenOnWhite.jpg',
        quantity: 10
      },
      {
        id: 2235,
        color: 'blue',
        image: './img/vmSocks-blue-onWhite.jpg',
        quantity: 0
      }
    ]
  }},
  methods: {
    addCart() {
      this.$emit("add-to-cart", this.variants[this.selectedVariant].id);
    },
    updateProduct(index) {
      this.selectedVariant = index 
    },
    removeFromCart() {
      this.$emit("remove-from-cart", this.variants[this.selectedVariant].id)
    }
  },
  computed: {
    title() {
      return this.brand + " " + this.product
    },
    image() {
      return this.variants[this.selectedVariant].image
    },
    inStock() {
      return this.variants[this.selectedVariant].quantity
    },
    shipping() {
      if (this.premium) return 'Free'
      return "$2.99"
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => this.reviews.push(productReview))
  }

})

Vue.component('det', {
  props: {
    details: {
      type: Array,
      required: true
    }
  },
  template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})


Vue.component("product-review", {
  template: `
      <form class="review-form" @submit.prevent="onSubmit">
          <p v-if="errors.length">
            <b>Please correct this following error(s):</b>
            <ul>
              <li v-for="err in errors">{{ err }}</li>
            </ul>
          </p>
      
          <p>
            <label for="name">Name:</label>
            <input id="name" v-model="name" placeholder="name">
          </p>
          
          <p>
            <label for="review">Review:</label>      
            <textarea id="review" v-model="review"></textarea>
          </p>
          
          <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
              <option>5</option>
              <option>4</option>
              <option>3</option>
              <option>2</option>
              <option>1</option>
            </select>
          </p>

          <p>Would you recommend this product?</p>
          <label>
            Yes
            <input type="radio" value="Yes" v-model="recommend"/>
          </label>
          <label>
            No
            <input type="radio" value="No" v-model="recommend"/>
          </label>
              
          <p>
            <input type="submit" value="Submit">  
          </p>    

    </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      recommend: null,
      errors:[]
    }
  },
  methods: {
    onSubmit() {
      if (this.name && this.rating && this.review){
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating,
          recommend: this.recommend
          }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
        this.recommend = null
      } else {
        if (!this.name) this.errors.push("Name required.")
        if (!this.recommend) this.errors.push("Recommend required.")
        if (!this.rating) this.errors.push("Rating required.")
        if (!this.review) this.errors.push("Review required.")
      }
    }
  }
})

Vue.component("product-tabs", {
  props: {
    reviews: {
      type: Array,
      required: true
    }
  },
  template: `
    <div>
      <span class="tab"
            :class = "{ activeTab: selectedTab === tab}"
            v-for="(tab,index) in tabs"
            :key="index"
            @click="selectedTab = tab">
      {{ tab }}</span>


      <div v-show="selectedTab === 'Reviews'">
        <h2>Reviews</h2>
        <p v-if='!reviews.length'>There no reviews yet.</p>
        <ul>
          <li v-for="rev in reviews">
            <p>{{ rev.name }}</p>
            <p>Rating: {{ rev.rating }}</p>
            <p>{{ rev.review }}</p>
            <p v-if="rev.recommend == 'Yes'">Recommended by customer</p>
          </li>
        </ul>

      </div>

      <product-review v-show="selectedTab === 'Make a review'">
      </product-review>


    </div>
  `,
  data() {
    return {
      tabs: ["Reviews", "Make a review"],
      selectedTab: "Reviews",
    }
  }
})

Vue.component('info-tabs', {
  props: {
    shipping: {
      required: true
    },
    details: {
      type: Array,
      required: true
    }
  },
  template:`
     <div> 
      
    
        <span class="tabs" 
              :class="{ activeTab: selectedTab === tab }"
              v-for="(tab, index) in tabs"
              @click="selectedTab = tab"
              :key="index"
        >{{ tab }}</span>
    

      <div v-show="selectedTab === 'Shipping'">
        <p>{{ shipping }}</p>
      </div>
      <det :details="details" v-show="selectedTab === 'Details'"></det>
    </div>
  `,
  data() {
    return {
      tabs: ["Shipping", "Details"],
      selectedTab: "Shipping"
    }
  }
})  


var app = new Vue({
  el: "#app",
  data: {
    premium: false,
    cart: []
  },
  methods: {
    updateCart(id) {
      this.cart.push(id)
    },
    removeCart(id) {
      for(var i = this.cart.length - 1; i >= 0; i--) {
        if (this.cart[i] === id) {
           this.cart.splice(i, 1);
        }
      }
    }
  }
})