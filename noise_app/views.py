import json
from django.shortcuts import render_to_response
from django.http import HttpResponse
from django.template import RequestContext, loader
from django.core import serializers
from pymongo import Connection
from bson import json_util
from dajaxice.decorators import dajaxice_register
from dajax.core import Dajax
from dajaxice.decorators import dajaxice_register

from dajaxice.core import dajaxice_autodiscover
dajaxice_autodiscover()


def index(request):
  
  return render_to_response('index.html', RequestContext(request))



