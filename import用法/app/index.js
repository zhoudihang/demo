import _ from 'lodash';
import {firstName, lastName, year} from './profile';

function component () {
  var element = document.createElement('div');

  /* 需要引入 lodash，下一行才能正常工作 */
  element.innerHTML = _.join(['Hello','webpack'], ' ');

  console.log(firstName)
  console.log(lastName)
  console.log(year)

  return element;
}

document.body.appendChild(component());