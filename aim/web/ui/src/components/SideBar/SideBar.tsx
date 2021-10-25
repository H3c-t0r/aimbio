import React from 'react';
import { NavLink } from 'react-router-dom';
import routes, { IRoute } from 'routes/routes';
import { Drawer } from '@material-ui/core';

import { Icon } from 'components/kit';
import { PathEnum } from 'config/enums/routesEnum';
import { IconName } from 'components/kit/Icon';

import logoImg from 'assets/logo.svg';

import './Sidebar.scss';

function SideBar(): React.FunctionComponentElement<React.ReactNode> {
  function getPathFromStorage(route: PathEnum): PathEnum | string {
    switch (route) {
      case PathEnum.Metrics:
        if (localStorage.getItem('metricsUrl')) {
          return localStorage.getItem('metricsUrl') || '';
        }
        return route;
      case PathEnum.Params:
        if (localStorage.getItem('paramsUrl')) {
          return localStorage.getItem('paramsUrl') || '';
        }
        return route;
      case PathEnum.Runs:
        if (localStorage.getItem('runsUrl')) {
          return localStorage.getItem('runsUrl') || '';
        }
        return route;
      default:
        return route;
    }
  }

  return (
    <div className='Sidebar__container'>
      <Drawer
        PaperProps={{ className: 'Sidebar__Paper' }}
        variant='permanent'
        anchor='left'
      >
        <ul className='Sidebar__List'>
          <NavLink
            exact={true}
            activeClassName={'Sidebar__anchor__active'}
            className='Sidebar__anchor'
            to={routes.HOME.path}
          >
            <li className='Sidebar__List__item'>
              <img src={logoImg} alt='logo' />
            </li>
          </NavLink>
          {Object.values(routes).map((route: IRoute, index: number) => {
            const { showInSidebar, path, displayName, icon } = route;
            return (
              showInSidebar && (
                <NavLink
                  key={index}
                  to={() => getPathFromStorage(path)}
                  exact={true}
                  isActive={(m, location) => {
                    let split = location.pathname.split('/');
                    return split.includes(path.split('/')[1]);
                  }}
                  activeClassName={'Sidebar__anchor__active'}
                  className='Sidebar__anchor'
                >
                  <li className='Sidebar__List__item'>
                    <Icon
                      className='Sidebar__List__item__icon'
                      fontSize={24}
                      name={icon as IconName}
                    />
                    <span className='Sidebar__List__item__text'>
                      {displayName}
                    </span>
                  </li>
                </NavLink>
              )
            );
          })}
        </ul>
      </Drawer>
    </div>
  );
}

export default React.memo(SideBar);
