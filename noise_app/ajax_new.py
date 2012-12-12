from django.utils import simplejson
from dajaxice.decorators import dajaxice_register
from django.template.loader import render_to_string
from dajax.core import Dajax
from pymongo import Connection

from dajaxice.core import dajaxice_autodiscover
dajaxice_autodiscover()

collection = {}
samplerates = {"ds": 0.1, "s": 1, "m": 60, "h": 60*60, "si": 60*60*6, "d": 60*60*24, "w": 60*60*24*7, "mo": 60*60*24*30}
db_min = float("inf")
db_max = float("-inf")

@dajaxice_register
def connect(req):
  global db
  connection = Connection()
  db = connection['noise_db']


@dajaxice_register
def getOneAudio(req, id):
  collection = db['noise_app_audio']
  aux = collection.find_one({'_id': id}, {'_id': 0, 'start': 1, 'end': 1, 'lat': 1, 'lng': 1, 'db_max': 1, 'db_min': 1})
  return simplejson.dumps(aux)

@dajaxice_register
def getFullAudioData(req, id, samplerate, request_start, request_end):
  collection = db['noise_app_audio']
  aux = collection.find_one({'_id': id}, {'_id': 0, 'start': 1, 'end': 1})
  record_start = aux['start']
  record_end = aux['end']
  
  if(request_start < record_start and record_start < request_end):
    query_start = record_start
  else:
    query_start = request_start

  if(request_end > record_end and record_end > request_start):
    query_end = record_end
  else:
    query_end = request_end


  numsamples = ((query_end - query_start)/samplerates[samplerate]) + 1
  offset = (query_start - record_start)/samplerates[samplerate]
  
  query_interval = [offset, numsamples]
  
#print request_start, request_end
#print record_start, record_end
#print query_start, query_end
#print query_end - query_start
#print query_interval
  aux = collection.find_one({'_id': id}, {'_id': 0, 'db_max': 1, 'db_min': 1, samplerate : { "$slice": query_interval }})
#print aux

  global db_min
  global db_max
  if(aux['db_min'] < db_min):
    db_min = aux['db_min']
  if(aux['db_max'] > db_max):
    db_max = aux['db_max']

  json = {}
  json['data'] = []
  count = 0
#print 0, (request_end - request_start)/samplerates[samplerate] + 1
  for i in range(0, int((request_end - request_start)/samplerates[samplerate]) + 1):
    #check if we have data inside the interval
    interval = [request_start+i*samplerates[samplerate], request_start+(i+1)*samplerates[samplerate]]
    
    #if samplerate is larger than interval
    if(record_start >= interval[0] and record_end <= interval[1]):
      json['data'].append({'x' : interval[0], 'y': -aux[samplerate][count]})
      count=count+1
    #if samplerate is smaller than interval
    elif(record_start <= interval[0] and record_end >= interval[1]):
      json['data'].append({'x' : interval[0], 'y': -db_min+aux[samplerate][count]})
      count=count+1
    else:
      json['data'].append({'x' : interval[0], 'y': 0})

  json['start'] = request_start
  json['end'] = request_end
  json['samplerate'] = samplerate
  json['chartsize'] = [0, -db_min]

  return simplejson.dumps(json)

@dajaxice_register
def loadFull311(req){
  collection = db['noise_app_complaint']
  json = collection.find({})
  return simplejson.dumps(json)
