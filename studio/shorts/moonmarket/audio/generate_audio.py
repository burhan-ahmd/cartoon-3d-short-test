"""Deterministic original 10-second score and sound effects for The Moon That Got Away."""
import math
from pathlib import Path
import wave
import numpy as np
from scipy.signal import butter, sosfilt

SR, DUR = 48000, 10.0
n = round(SR * DUR)
t = np.arange(n, dtype=np.float64) / SR
rng = np.random.default_rng(240517)
left = np.zeros(n); right = np.zeros(n)

def put(buf, start, sig, pan=0.0):
    i = round(start * SR); a = max(0, i); b = min(n, i + len(sig))
    if b <= a: return
    sig = sig[a-i:b-i]
    lg, rg = math.sqrt((1-pan)*0.5), math.sqrt((1+pan)*0.5)
    left[a:b] += sig * lg; right[a:b] += sig * rg

# Soft, bright original music bed: plucked pentatonic notes, pizzicato bass, warm sustained pad.
notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 783.99,
         523.25, 659.25, 783.99, 987.77, 880.0, 783.99, 659.25, 523.25,
         587.33, 698.46, 880.0, 1046.5, 987.77, 880.0, 783.99, 659.25,
         523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25]
for k, f in enumerate(notes):
    start = k * 0.3125
    d = min(0.48, DUR-start)
    if d <= 0: continue
    x = np.arange(round(d*SR))/SR
    env = np.exp(-x*5.2)*np.minimum(1, x*90)
    sig = (np.sin(2*np.pi*f*x)+.32*np.sin(2*np.pi*f*2.01*x)+.12*np.sin(2*np.pi*f*3.98*x))*env*.105
    put(left, start, sig, -0.18 if k%2==0 else 0.18)
    bassf = [130.81, 174.61, 196.0, 146.83][(k//4)%4]
    bass = np.sin(2*np.pi*bassf*x)*np.exp(-x*7)*np.minimum(1,x*100)*.10
    put(left, start, bass, 0)

# Airy twilight ambience: filtered noise bed, gently pulsing and stereo-wide.
noise = sosfilt(butter(3, 900, btype='lowpass', fs=SR, output='sos'), rng.normal(0,1,n))
noise /= max(1e-8, np.max(np.abs(noise)))
amb = noise * (.014 + .008*np.sin(2*np.pi*.18*t))
put(left, 0, amb, -0.42); put(right, 0, amb, 0.42)

# Tiny paper flutter/whoosh as the moon balloon escapes and climbs.
def whoosh(start, dur, strength):
    m=round(dur*SR); x=np.arange(m)/SR
    z=sosfilt(butter(3,[400,4000],btype='bandpass',fs=SR,output='sos'),rng.normal(0,1,m))
    z/=max(1e-8,np.max(np.abs(z)))
    env=np.sin(np.pi*np.clip(x/dur,0,1))**1.7
    put(left,start,z*env*strength,-.25); put(right,start,z*env*strength,.25)
whoosh(.28,1.1,.075); whoosh(5.0,1.25,.105)

# Light running footsteps, each with a warm thump and small grit tick.
for k in range(15):
    start=.72+k*.30
    d=.12; x=np.arange(round(d*SR))/SR
    th=np.sin(2*np.pi*(88-25*x/d)*x)*np.exp(-x*35)*.20
    grit=sosfilt(butter(2,1200,btype='highpass',fs=SR,output='sos'),rng.normal(0,1,len(x)))*np.exp(-x*70)*.025
    put(left,start,th+grit,-.35 if k%2==0 else .35)

# Balloon string twang at the catch, then soft hat bonk and a three-note laugh-like chime.
for start, f, amp in [(5.37,660,.15),(5.43,990,.12),(8.05,210,.24),(8.18,784,.10),(8.32,988,.11),(8.47,1175,.10)]:
    d=.38 if f>400 else .22; x=np.arange(round(d*SR))/SR
    sig=np.sin(2*np.pi*f*x)*np.exp(-x*(9 if f>400 else 22))*amp
    sig += .22*np.sin(2*np.pi*f*2.7*x)*np.exp(-x*17)*amp
    put(left,start,sig,.08)

# Fade edges and master conservatively to avoid clipping.
fade=np.minimum(1,np.minimum(t/.16,(DUR-t)/.28))
stereo=np.stack([left*fade,right*fade],axis=1)
peak=np.max(np.abs(stereo)); stereo *= min(1.0,.84/max(peak,1e-9))
pcm=np.round(stereo*32767).astype('<i2')
out = Path(__file__).resolve().parents[3] / 'public' / 'audio' / 'moonmarket.wav'
with wave.open(str(out),'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'wrote 10.000 s stereo WAV, 48 kHz, peak {np.max(np.abs(stereo)):.3f}')
