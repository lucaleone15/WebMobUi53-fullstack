import './bootstrap';
import { createApp } from 'vue';
import PollShow from './PollShow.vue';

const el = document.getElementById('app');
const props = JSON.parse(el.dataset.props ?? '{}');

createApp(PollShow, props).mount(el);
