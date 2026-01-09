import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/login.vue";
// import Register from "../pages/register.vue";
// import Dashboard from "../pages/Dashboard.vue";
// import Search from "../pages/Search.vue";
// import ItemDetails from "../pages/ItemDetails.vue";
// import CreateItem from "../pages/CreateItem.vue";
// import BidHistory from "../pages/BidHistory.vue";
// import Questions from "../pages/Questions.vue";
// import AnswerQuestion from "../pages/AnswerQuestion.vue";

export default createRouter({
    history: createWebHistory(),

    routes: [
        { path: "/", component: Search },
        { path: "/login", component: Login },

    ],
});
//home Hot auctions list and header with slogan
//login /signup also sign in pop up ding in new page
//logout button clear session token from local
//item page counter till end contains highest big and questions under big button under image ask question
//search page status filter and categories filter
