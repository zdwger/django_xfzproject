
from django.contrib.auth import login,logout,authenticate
from django.views.decorators.http import require_POST
from .forms import LoginForm,RegisterForm
from django.http import JsonResponse
from utils import restful
from django.shortcuts import redirect,reverse
from utils.captcha.xfzcaptcha import Captcha
from io import BytesIO
from django.http import HttpResponse
from utils import smssender
from django.core.cache import  cache
from django.contrib.auth import get_user_model

User = get_user_model()

@require_POST
def login_view(request):
    form = LoginForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        password = form.cleaned_data.get('password')
        remember = form.cleaned_data.get('remember')
        user = authenticate(request,username=telephone,password=password)
        if user:
            if user.is_active:
                login(request,user)
                if remember:
                    request.session.set_expiry(None)
                else:
                    request.session.set_expiry(0)
                return restful.ok()
            else:
                return restful.unauth(message="您的账号已经被冻结了！")
        else:
            return restful.params_error(message="手机号或者密码错误！")
    else:
        errors = form.get_errors()
        # {"password":['密码最大长度不能超过20为！','xxx'],"telephone":['xx','x']}
        return restful.params_error(message=errors)


def logout_view(request):
    logout(request)
    return redirect(reverse("index"))

@require_POST
def register(request):
    form = RegisterForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        username = form.cleaned_data.get('username')
        password = form.cleaned_data.get('password1')
        user = User.objects.create_user(telephone=telephone,username=username,password=password)
        login(request,user)
        return restful.ok()
    else:
        print(form.get_errors())
        return restful.params_error(message=form.get_errors())

def img_captcha(request):
    text,image = Captcha.gene_code()
    out = BytesIO()
    image.save(out,'png')
    out.seek(0)

    response = HttpResponse(content_type='image/png')
    response.write(out.read())
    response['Content-length'] = out.tell()
    cache.set(text.lower(),text.lower(),5*60)
    return response

def sms_captcha(request):
    # /sms_captcha/?telephone=xxx
    telephone = request.GET.get('telephone')
    code = Captcha.gene_text()
    print('短信验证码：',code)
    cache.set(telephone,code,5*60)
    # result = aliyunsms.send_sms(telephone,code)
    # result = smssender.send(telephone,code)
    # if result:
    #     return restful.ok()
    # else:
    #     return restful.params_error(message="短信验证码发送失败！")
    print('短信验证码：',code)
    return restful.ok()


def cache_test(request):
    cache.set('username','zhiliao',60)
    result = cache.get('username')
    print(request)
    return HttpResponse("success")
