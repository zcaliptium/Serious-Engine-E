/* Copyright (c) 2002-2012 Croteam Ltd.
This program is free software; you can redistribute it and/or modify
it under the terms of version 2 of the GNU General Public License as published by
the Free Software Foundation


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA. */

#ifndef SE_INCL_GAME_MENU_NETWORKSTART_H
#define SE_INCL_GAME_MENU_NETWORKSTART_H
#ifdef PRAGMA_ONCE
  #pragma once
#endif

#include "GameMenu.h"
#include "GUI/Components/MGButton.h"
#include "GUI/Components/MGEdit.h"
#include "GUI/Components/MGTitle.h"
#include "GUI/Components/MGTrigger.h"


class CNetworkStartMenu : public CGameMenu
{
  public:
    CMGTitle *gm_pTitle;
    CMGEdit *gm_pSessionName;
    CMGTrigger *gm_pGameType;
    CMGTrigger *gm_pDifficulty;
    CMGButton *gm_pLevel;
    CMGTrigger *gm_pMinPlayers;
    CMGTrigger *gm_pMaxPlayers;
    //CMGTrigger *gm_pWaitAllPlayers;
    CMGTrigger *gm_pVisible;
    CMGButton *gm_pGameOptions;
    CMGButton *gm_pGameMutators;
    CMGButton *gm_pStart;

  public:
    void Initialize_t(void);
    void StartMenu(void);
    void EndMenu(void);
    virtual BOOL OnEvent(const SEvent& event); // [SSE]
};

#endif  /* include-once check. */