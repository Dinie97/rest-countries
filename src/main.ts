import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import "/node_modules/primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-indigo/theme.css";

import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import OrganizationChart from "primevue/organizationchart";
import Chart from "primevue/chart";

import "primeicons/primeicons.css";

const app = createApp(App);

app.use(PrimeVue);
/* eslint-disable */
app.component("Button", Button);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("InputText", InputText);
app.component("Chart", Chart);
app.component("OrganizationChart", OrganizationChart);

app.mount("#app");
