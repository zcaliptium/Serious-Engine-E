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

21365
%{
  #include "StdH.h"
  #include "EntitiesMP/Bullet.h"
  #include "EntitiesMP/SoundHolder.h"
%}

enum EBSUsePenCausedAs {
  0 EBSUP_NONE        "0 None",
  1 EBSUP_INFLICTOR   "1 Inflictor",
  2 EBSUP_DESTINATION "2 Target",
};

class CBulletShooter : CRationalEntity {
name      "BulletShooter";
thumbnail "Thumbnails\\BulletShooter.tbn";
features  "HasName", "IsTargetable";

properties:
   1 CTString m_strName    "Name"   = "Bullet Shooter",
   2 BOOL m_bActive        "Active" = TRUE,
   
   6 FLOAT m_fBulletDamage "Bullet Damage" = 10.0F,
   7 FLOAT m_fJitter       "Bullet Jitter" = 0.0F,
   8 FLOAT m_fBulletSize   "Bullet Size" = 0.1F,
   9 FLOAT m_fRange        "Bullet Range"  = 200.0F,
  10 BOOL  m_bBulletTrail  "Bullet Trail"  = FALSE,
  
  15 CEntityPointer m_penInflictor "Inflictor",
  16 CEntityPointer m_penTarget    "Target",

  17 enum EBSUsePenCausedAs m_eUsePenCausedAs "Use penCaused as ..." = EBSUP_NONE,

  20 FLOAT m_fWait      "Min Fire Delay" = 0.1F,
  21 FLOAT m_tmFired = 0.0F,
  
  50 CEntityPointer m_penSoundFire  "Sound Fire",
  51 CSoundObject m_soFire,

  {
    CAutoPrecacheSound m_aps;
  }
  
components:
  1 class  CLASS_BULLET      "Classes\\Bullet.ecl",

  6 model   MODEL_BULLETSHOOTER   "Models\\Editor\\BulletShooter.mdl",
  7 texture TEXTURE_BULLETSHOOTER "Models\\Editor\\BulletShooter.tex",
  
functions:

  // --------------------------------------------------------------------------------------
  // Precache entity components.
  // --------------------------------------------------------------------------------------
  void Precache(void)
  {
    PrecacheClass(CLASS_BULLET);
  }

  // --------------------------------------------------------------------------------------
  // Apply mirror and stretch to the entity.
  // --------------------------------------------------------------------------------------
  void MirrorAndStretch(FLOAT fStretch, BOOL bMirrorX) {}
  
  // --------------------------------------------------------------------------------------
  // Fires the bullet in given direction with given properties.
  // --------------------------------------------------------------------------------------
  void ShootBullet(const ETrigger &eTrigger, const CPlacement3D &pl)
  {
    CEntity *penInflictor = m_penInflictor;
    CEntity *penTarget = m_penTarget;
    
    CEntityPointer penBullet = CreateEntity(pl, CLASS_BULLET);

    // Initialize the bullet.
    EBulletInit eInit;
    
    if (m_eUsePenCausedAs == EBSUP_INFLICTOR) {
      penInflictor = eTrigger.penCaused;
    } else if (m_eUsePenCausedAs == EBSUP_DESTINATION) {
      penTarget = eTrigger.penCaused;
    }

    if (penInflictor) {
      eInit.penOwner = penInflictor;
    } else {
      eInit.penOwner = this;
    }
  
    eInit.fDamage = m_fBulletDamage;
    penBullet->Initialize(eInit);

    if (penTarget) {
      ((CBullet&)*penBullet).CalcTarget(penTarget, m_fRange);      
    } else {
      ((CBullet&)*penBullet).CalcTarget(m_fRange);
    }

    ((CBullet&)*penBullet).m_fBulletSize = m_fBulletSize;
    ((CBullet&)*penBullet).CalcJitterTarget(m_fJitter);
    ((CBullet&)*penBullet).LaunchBullet(TRUE, m_bBulletTrail, TRUE);
    ((CBullet&)*penBullet).DestroyBullet();
  }

  // --------------------------------------------------------------------------------------
  // Calls firing method and plays sound if any sound selected.
  // --------------------------------------------------------------------------------------
  void Shoot(const ETrigger &eTrigger, const CPlacement3D &pl)
  {
    ShootBullet(eTrigger, pl);

    // If we have SoundHolder selected then shooting sound.
    if (m_penSoundFire != NULL)
    {
      CSoundHolder &sh = (CSoundHolder&)*m_penSoundFire;
      m_soFire.Set3DParameters(FLOAT(sh.m_rFallOffRange), FLOAT(sh.m_rHotSpotRange), sh.m_fVolume, sh.m_fPitch);
      PlaySound(m_soFire, sh.m_fnSound, sh.m_iPlayType);
    }
  }
procedures:

/************************************************************
 *                M  A  I  N    L  O  O  P                  *
 ************************************************************/
  // --------------------------------------------------------------------------------------
  // The entry point.
  // --------------------------------------------------------------------------------------
  Main(EVoid)
  {
    // Validate Sound
    if (m_penSoundFire != NULL && !IsDerivedFromClass(m_penSoundFire, "SoundHolder")) {
      m_penSoundFire = NULL;
      WarningMessage("Only SoundHolder can be selected as ""Sound Fire"" for BulletShooter!");
    }

    InitAsEditorModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_IMMATERIAL);

    // Set appearance.
    SetModel(MODEL_BULLETSHOOTER);
    SetModelMainTexture(TEXTURE_BULLETSHOOTER);

    // Spawn in world editor.
    autowait(0.1f);
    
    wait()
    {
      on(EBegin) : {
        resume;
      };
    
      on(ETrigger eTrigger) :
      {
        if (m_bActive && m_tmFired + m_fWait < _pTimer->CurrentTick()) {
          m_tmFired = _pTimer->CurrentTick();
          Shoot(eTrigger, GetPlacement());
        }
    
        resume;
      }

      on(EActivate):{
        m_bActive = TRUE;
        resume;
      }

      on(EDeactivate):{
        m_bActive = FALSE;
        resume;
      }

      otherwise() : { resume; };
    }

    // Cease to exist.
    Destroy();

    return;
  }
};